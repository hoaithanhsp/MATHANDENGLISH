import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle
} from 'docx';
import { Exam, Question } from '../types';

interface ExportDocxOptions {
  includeSolutions: boolean;
  exam: Exam;
  mode?: 'bilingual' | 'english_only';
}

/**
 * Exports an exam to Microsoft Word (.docx)
 * Strictly keeps LaTeX code in standard $ ... $ and $$ ... $$ format
 */
export async function exportExamToDocx(options: ExportDocxOptions): Promise<void> {
  const { exam, includeSolutions, mode = exam.mode } = options;

  const children: Paragraph[] = [];

  // Header Title
  children.push(
    new Paragraph({
      text: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO HẢI PHÒNG',
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'KỲ THI CHỌN HỌC SINH GIỎI THÀNH PHỐ CẤP THPT',
          bold: true,
          size: 26,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `BÀI THI MÔN TOÁN BẰNG TIẾNG ANH`,
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${exam.title.toUpperCase()} ${includeSolutions ? '– [ĐÁP ÁN & LỜI GIẢI CHI TIẾT]' : '– [ĐỀ THI]' }`,
          bold: true,
          italics: true,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Thời gian làm bài: ${exam.duration_minutes} phút (Không kể thời gian giao đề) | Mã đề: ${exam.access_code}`,
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: '-------------------------------------------------------------------------------------------------------',
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '📌 HƯỚNG DẪN CÔNG THỨC TOÁN TRONG MICROSOFT WORD: Các công thức toán được mã hóa theo chuẩn LaTeX ($...$). Trong Word 2016 / 365, Thầy/Cô và các em học sinh có thể quét chọn biểu thức toán và bấm tổ hợp phím [Alt] + [=] để chuyển đổi tự động sang Equation toán học trực quan.',
          italics: true,
          size: 18,
          color: '555555',
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
    })
  );

  const questions = exam.questions || [];
  const part1Questions = questions.filter((q) => q.part === 'PART_1');
  const part2Questions = questions.filter((q) => q.part === 'PART_2');

  // PART 1 HEADER
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART I: MULTIPLE CHOICE QUESTIONS (12 questions / 12 câu)',
          bold: true,
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
          size: 20,
        }),
      ],
      spacing: { after: 180 },
    })
  );

  part1Questions.forEach((q) => {
    children.push(...formatQuestionDocx(q, mode, includeSolutions));
  });

  // PART 2 HEADER
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'PART II: SHORT-ANSWER QUESTIONS (10 questions / 10 câu)',
          bold: true,
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
          size: 20,
        }),
      ],
      spacing: { after: 180 },
    })
  );

  part2Questions.forEach((q) => {
    children.push(...formatQuestionDocx(q, mode, includeSolutions));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `${exam.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${includeSolutions ? 'Solutions' : 'Exam'}.docx`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatQuestionDocx(q: Question, mode: 'bilingual' | 'english_only', includeSolutions: boolean): Paragraph[] {
  const paras: Paragraph[] = [];

  // Question statement
  const qChildren: TextRun[] = [
    new TextRun({
      text: `Question ${q.order_index} [${q.strand.replace('_', ' ').toUpperCase()} | ${q.difficulty.toUpperCase()}]: `,
      bold: true,
      size: 21,
    }),
    new TextRun({
      text: q.question_en,
      size: 21,
    }),
  ];

  paras.push(
    new Paragraph({
      children: qChildren,
      spacing: { before: 140, after: 60 },
    })
  );

  // Vietnamese translation if bilingual
  if (mode === 'bilingual' && q.question_vi) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `(Dịch tiếng Việt): ${q.question_vi}`,
            italics: true,
            size: 20,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Options if PART_1 (English only, no translation for options)
  if (q.part === 'PART_1' && q.options_en && q.options_en.length > 0) {
    const letters = ['A', 'B', 'C', 'D'];
    q.options_en.forEach((opt, idx) => {
      const label = letters[idx] || `${idx + 1}`;
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `    ${opt.startsWith(label) ? opt : `${label}. ${opt}`}`,
              size: 20,
            }),
          ],
          spacing: { after: 40 },
        })
      );
    });
  }

  // Solutions if requested
  if (includeSolutions) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `    ➜ Correct Answer: `,
            bold: true,
            color: '006600',
            size: 20,
          }),
          new TextRun({
            text: `${q.correct_answer}`,
            bold: true,
            size: 20,
          }),
        ],
        spacing: { before: 60, after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `    [Solution / Lời giải chi tiết]: `,
            bold: true,
            size: 20,
          }),
          new TextRun({
            text: q.solution_en,
            size: 20,
          }),
        ],
        spacing: { after: 60 },
      })
    );

    if (mode === 'bilingual' && q.solution_vi) {
      paras.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `    [Giải thích Tiếng Việt]: ${q.solution_vi}`,
              italics: true,
              size: 19,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  return paras;
}
