import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { Exam, Question } from '../types';

const FONT = 'Times New Roman';

function cleanDocxText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\+n(?!(nabla|natural|neg|neq|ne|nearrow|nexists|notin|normalsize|nu|null|nwarrow|nRightarrow|nLeftarrow)\b)/g, '\n')
    .replace(/(^|\n)\s*[\*\-•]\s*/g, '$1• ');
}

/**
 * Ensure LaTeX expressions are wrapped in $...$ delimiters.
 * Detects common LaTeX commands (\\frac, \\sqrt, \\sin, \\triangle, etc.)
 * that appear without $ delimiters and wraps them.
 */
function ensureLatexDelimiters(text: string): string {
  if (!text) return text;
  // If text already has $ delimiters, return as-is
  if (text.includes('$')) return text;
  // Check if text contains LaTeX commands
  const hasLatex = /\\(?:frac|sqrt|sin|cos|tan|log|ln|lim|sum|prod|int|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega|triangle|angle|perp|parallel|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|subset|supset|cup|cap|in|notin|forall|exists|mathbb|mathrm|text|overline|underline|vec|hat|bar|tilde|left|right|binom|begin|end)/i.test(text);
  if (hasLatex) {
    return `$${text}$`;
  }
  return text;
}

/**
 * TextRun không hiểu ký tự xuống dòng — tách theo dòng và chèn ngắt dòng thật của Word.
 */
function textRuns(text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}): TextRun[] {
  const lines = cleanDocxText(text).split('\n');
  return lines.map(
    (line, i) =>
      new TextRun({
        text: line,
        font: FONT,
        ...opts,
        ...(i > 0 ? { break: 1 } : {}),
      }),
  );
}

const OPTION_LABEL = /^\s*\(?([A-D])[.):]\s*/;

const STRAND_LABEL: Record<string, string> = {
  algebra_calculus: 'Algebra & Calculus',
  geometry_measurement: 'Geometry & Measurement',
  statistics_discrete: 'Statistics, Probability & Discrete',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  understanding: 'Thông hiểu',
  application: 'Vận dụng',
  advanced: 'Vận dụng cao',
};

/** Tên file an toàn: bỏ dấu tiếng Việt thay vì biến cả tiêu đề thành "_____". */
function toSafeFileName(title: string): string {
  return (
    (title || 'De_thi')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80) || 'De_thi'
  );
}

interface ExportDocxOptions {
  includeSolutions: boolean;
  exam: Exam;
  mode?: 'bilingual' | 'english_only';
}

/** Bảng đáp án nhanh, mỗi hàng 11 câu. */
function buildAnswerKeyTable(questions: Question[]): Table {
  const perRow = 11;
  const rows: TableRow[] = [];
  for (let start = 0; start < questions.length; start += perRow) {
    const chunk = questions.slice(start, start + perRow);
    const cell = (text: string, bold = false) =>
      new TableCell({
        width: { size: Math.floor(100 / perRow), type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text, bold, font: FONT, size: 20 })],
          }),
        ],
      });
    rows.push(new TableRow({ children: chunk.map((q) => cell(`Câu ${q.order_index}`, true)) }));
    rows.push(new TableRow({ children: chunk.map((q) => cell(String(q.correct_answer ?? ''))) }));
  }
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

/**
 * Exports an exam to Microsoft Word (.docx)
 * Strictly keeps LaTeX code in standard $ ... $ and $$ ... $$ format
 */
export async function exportExamToDocx(options: ExportDocxOptions): Promise<void> {
  const { exam, includeSolutions, mode = exam.mode } = options;

  const children: (Paragraph | Table)[] = [];
  const questions = [...(exam.questions || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const part1Questions = questions.filter((q) => q.part === 'PART_1');
  const part2Questions = questions.filter((q) => q.part !== 'PART_1');
  const isTopic = exam.exam_type === 'topic_practice';

  // Header Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO HẢI PHÒNG', bold: true, font: FONT, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: isTopic ? 'ĐỀ LUYỆN TẬP CHUYÊN ĐỀ – ĐỘI TUYỂN HSG' : 'KỲ THI CHỌN HỌC SINH GIỎI THÀNH PHỐ CẤP THPT',
          bold: true,
          font: FONT,
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'BÀI THI MÔN TOÁN BẰNG TIẾNG ANH', bold: true, font: FONT, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${(exam.title || '').toUpperCase()} ${includeSolutions ? '– [ĐÁP ÁN & LỜI GIẢI CHI TIẾT]' : '– [ĐỀ THI]'}`,
          bold: true,
          italics: true,
          font: FONT,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Thời gian làm bài: ${exam.duration_minutes || 90} phút (Không kể thời gian giao đề) | ${questions.length} câu | Mã đề: ${exam.access_code}`,
          italics: true,
          font: FONT,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Ghi chú: Công thức toán viết theo chuẩn LaTeX ($...$). Trong Word 365: quét chọn biểu thức (không gồm dấu $), bấm [Alt] + [=], chọn chế độ LaTeX rồi bấm Convert để chuyển thành Equation.',
          italics: true,
          font: FONT,
          size: 18,
          color: '555555',
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
    }),
  );

  if (includeSolutions && questions.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'BẢNG ĐÁP ÁN (ANSWER KEY)', bold: true, font: FONT, size: 22 })],
        spacing: { before: 120, after: 100 },
      }),
      buildAnswerKeyTable(questions),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    );
  }

  // PART 1
  if (part1Questions.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `PART I: MULTIPLE CHOICE QUESTIONS (${part1Questions.length} questions / ${part1Questions.length} câu)`,
            bold: true,
            font: FONT,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Each question has four options A, B, C, D. Choose exactly one correct answer.',
            italics: true,
            font: FONT,
            size: 20,
          }),
        ],
        spacing: { after: 180 },
      }),
    );
    part1Questions.forEach((q) => {
      children.push(...formatQuestionDocx(q, mode, includeSolutions));
    });
  }

  // PART 2
  if (part2Questions.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `PART II: SHORT-ANSWER QUESTIONS (${part2Questions.length} questions / ${part2Questions.length} câu)`,
            bold: true,
            font: FONT,
            size: 24,
          }),
        ],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Write the exact concise mathematical answer (integer, irreducible fraction a/b, or decimal).',
            italics: true,
            font: FONT,
            size: 20,
          }),
        ],
        spacing: { after: 180 },
      }),
    );
    part2Questions.forEach((q) => {
      children.push(...formatQuestionDocx(q, mode, includeSolutions));
    });
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: includeSolutions ? '---------- HẾT ĐÁP ÁN ----------' : '---------- HẾT ----------', bold: true, font: FONT, size: 20 })],
    }),
  );

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: FONT, size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${toSafeFileName(exam.title)}_${includeSolutions ? 'Dap_an' : 'De_thi'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Thu hồi URL ngay sau click có thể hủy lượt tải trên Safari/Firefox
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function formatQuestionDocx(q: Question, mode: 'bilingual' | 'english_only', includeSolutions: boolean): Paragraph[] {
  const paras: Paragraph[] = [];

  // Đề phát cho học sinh không lộ mạch kiến thức / mức độ; bản đáp án thì có để GV đối chiếu ma trận
  const meta = includeSolutions
    ? ` [${STRAND_LABEL[q.strand] || q.strand || ''}${q.difficulty ? ` | ${DIFFICULTY_LABEL[q.difficulty] || q.difficulty}` : ''}]`
    : '';

  paras.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Question ${q.order_index}${meta}: `, bold: true, font: FONT, size: 22 }),
        ...textRuns(q.question_en || '', { size: 22 }),
      ],
      spacing: { before: 140, after: 60 },
    }),
  );

  // Vietnamese translation if bilingual
  if (mode === 'bilingual' && q.question_vi) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: '(Dịch tiếng Việt): ', italics: true, font: FONT, size: 20 }),
          ...textRuns(q.question_vi, { italics: true, size: 20 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  // Options if PART_1 (English only, no translation for options)
  if (q.part === 'PART_1' && q.options_en && q.options_en.length > 0) {
    const letters = ['A', 'B', 'C', 'D'];
    q.options_en.forEach((opt, idx) => {
      const label = letters[idx] || `${idx + 1}`;
      const body = String(opt ?? '').replace(OPTION_LABEL, '');
      paras.push(
        new Paragraph({
          children: [
            new TextRun({ text: `    ${label}. `, bold: true, font: FONT, size: 22 }),
            new TextRun({ text: ensureLatexDelimiters(body), font: FONT, size: 22 }),
          ],
          spacing: { after: 40 },
        }),
      );
    });
  }

  // Solutions if requested
  if (includeSolutions) {
    const accepted = (q.acceptable_answers || []).filter(Boolean);
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: '    ➜ Correct Answer: ', bold: true, color: '006600', font: FONT, size: 20 }),
          new TextRun({ text: ensureLatexDelimiters(String(q.correct_answer ?? '')), bold: true, font: FONT, size: 20 }),
          ...(q.part !== 'PART_1' && accepted.length > 0
            ? [new TextRun({ text: `  (chấp nhận: ${accepted.join('; ')})`, italics: true, font: FONT, size: 20 })]
            : []),
        ],
        spacing: { before: 60, after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '    [Solution]: ', bold: true, font: FONT, size: 20 }),
          ...textRuns(ensureLatexDelimiters(q.solution_en || ''), { size: 20 }),
        ],
        spacing: { after: 60 },
      }),
    );

    if (mode === 'bilingual' && q.solution_vi) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({ text: '    [Lời giải tiếng Việt]: ', bold: true, italics: true, font: FONT, size: 19 }),
            ...textRuns(q.solution_vi, { italics: true, size: 19 }),
          ],
          spacing: { after: 100 },
        }),
      );
    }
  }

  return paras;
}
