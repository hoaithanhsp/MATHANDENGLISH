import katex from 'katex';
import { Exam } from '../types';

/**
 * Render text containing inline ($...$) and block ($$...$$) math using KaTeX
 */
function renderLatexToHtml(text: string): string {
  if (!text) return '';

  // Block math: $$...$$
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return `<div class="katex-display-block">${katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })}</div>`;
    } catch {
      return `<div class="katex-error">[Math: ${math}]</div>`;
    }
  });

  // Inline math: $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `[Math: ${math}]`;
    }
  });

  // Convert newlines to breaks
  return processed.replace(/\n/g, '<br/>');
}

export interface PrintExamOptions {
  sheetType?: 'question_sheet' | 'solution_sheet';
  schoolName?: string;
  studentName?: string;
}

/**
 * In hoặc xuất PDF đề thi chuẩn phom Sở GD&ĐT Hải Phòng
 */
export function printHaiPhongExam(exam: Exam, options: PrintExamOptions = {}): void {
  const { sheetType = 'question_sheet' } = options;
  const questions = exam.questions || [];
  const part1 = questions.filter((q) => q.part === 'PART_1');
  const part2 = questions.filter((q) => q.part === 'PART_2');

  const isSolution = sheetType === 'solution_sheet';
  const pageTitle = isSolution
    ? `HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN - ${exam.title}`
    : `ĐỀ THI HSG - ${exam.title}`;

  // CSS KaTeX inline để đảm bảo khi mở window.print() công thức hiển thị hoàn hảo
  const printHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <title>${pageTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"/>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .header-table td {
      vertical-align: top;
      padding: 2px 4px;
    }
    .header-left {
      width: 44%;
      text-align: center;
      font-size: 11pt;
    }
    .header-right {
      width: 56%;
      text-align: center;
      font-size: 11pt;
    }
    .main-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .sub-title {
      font-size: 11pt;
      font-weight: bold;
    }
    .divider-line {
      width: 120px;
      height: 1px;
      background: #000;
      margin: 3px auto;
    }
    .exam-badge {
      display: inline-block;
      border: 1px solid #000;
      padding: 2px 8px;
      font-weight: bold;
      font-size: 10pt;
      margin-top: 4px;
    }
    /* Candidate block */
    .candidate-box {
      width: 100%;
      border: 1px solid #000;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 11pt;
    }
    .candidate-box td {
      border: 1px solid #000;
      padding: 4px 8px;
      vertical-align: middle;
    }
    .dotted-line {
      border-bottom: 1px dotted #000;
      display: inline-block;
      min-width: 120px;
    }
    /* Section Headings */
    .section-header {
      background: #f0f0f0;
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      font-weight: bold;
      padding: 4px 8px;
      margin: 14px 0 8px 0;
      font-size: 12pt;
      text-transform: uppercase;
    }
    /* Questions */
    .question-item {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .question-label {
      font-weight: bold;
    }
    .question-en {
      font-size: 12.5pt;
      margin-bottom: 3px;
    }
    .question-vi {
      font-size: 11.5pt;
      font-style: italic;
      color: #222;
      background: #fafafa;
      border-left: 2.5px solid #555;
      padding: 2px 6px;
      margin: 3px 0 5px 0;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 14px;
      margin: 6px 0 6px 12px;
      font-size: 12pt;
    }
    .option-cell {
      padding: 2px 0;
    }
    .short-answer-line {
      margin: 8px 0 8px 12px;
      font-size: 11.5pt;
    }
    .answer-box {
      display: inline-block;
      border: 1px solid #000;
      width: 140px;
      height: 22px;
      vertical-align: middle;
      margin-left: 8px;
    }
    /* Solution block */
    .solution-box {
      border: 1px dashed #333;
      background: #f9f9f9;
      padding: 6px 10px;
      margin-top: 4px;
      font-size: 11pt;
    }
    .solution-box .sol-ans {
      font-weight: bold;
      color: #0b5cab;
      margin-bottom: 4px;
    }
    /* Answer summary table for solutions */
    .answer-summary-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 10.5pt;
    }
    .answer-summary-table th, .answer-summary-table td {
      border: 1px solid #000;
      padding: 4px 6px;
      text-align: center;
    }
    .answer-summary-table th {
      background: #e8e8e8;
      font-weight: bold;
    }
    .footer-note {
      text-align: center;
      font-style: italic;
      margin-top: 20px;
      border-top: 1px solid #888;
      padding-top: 6px;
      font-size: 11pt;
    }
    .katex-display-block {
      margin: 4px 0;
      text-align: center;
    }
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- HEADER CHUẨN SỞ GD&ĐT HẢI PHÒNG -->
  <table class="header-table">
    <tr>
      <td class="header-left">
        <div>ỦY BAN NHÂN DÂN THÀNH PHỐ HẢI PHÒNG</div>
        <div class="main-title">SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
        <div class="divider-line"></div>
        <div class="exam-badge">${isSolution ? 'HƯỚNG DẪN CHẤM CHÍNH THỨC' : 'ĐỀ THI CHÍNH THỨC'}</div>
      </td>
      <td class="header-right">
        <div class="main-title">KỲ THI CHỌN HỌC SINH GIỎI CẤP THÀNH PHỐ</div>
        <div class="sub-title">NĂM HỌC 2026 - 2027</div>
        <div><strong>Môn thi: TOÁN HỌC (BẰNG TIẾNG ANH) - LỚP 11</strong></div>
        <div><em>Thời gian: 90 phút (không kể thời gian phát đề)</em></div>
        <div style="font-size: 10pt; margin-top: 2px;">Mã đề thi: <strong>${exam.access_code || 'HP-MATH'}</strong></div>
      </td>
    </tr>
  </table>

  ${
    !isSolution
      ? `
  <!-- KHUNG THÔNG TIN THÍ SINH & ĐIỂM SỐ -->
  <table class="candidate-box">
    <tr>
      <td style="width: 65%;">
        <div>Họ và tên thí sinh: ............................................................................ Giới tính: .................</div>
        <div style="margin-top: 4px;">Ngày sinh: ................................. Học sinh trường/đội tuyển: ...............................................</div>
        <div style="margin-top: 4px;">Số báo danh: <strong>[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</strong> &nbsp; &nbsp; &nbsp; Phòng thi số: .........</div>
      </td>
      <td style="width: 35%; text-align: center;">
        <div style="font-weight: bold; margin-bottom: 2px;">ĐIỂM BÀI THI / 20.00</div>
        <div style="font-size: 10pt; height: 35px; border: 1px dashed #666; margin: 3px 0;"></div>
        <div style="font-size: 9.5pt;">Chữ ký Giám khảo 1 / Giám khảo 2</div>
      </td>
    </tr>
  </table>
  `
      : ''
  }

  ${
    isSolution
      ? `
  <!-- BẢNG TỔNG HỢP ĐÁP ÁN NHANH -->
  <div style="font-weight: bold; margin: 10px 0 4px 0; font-size: 12pt;">I. BẢNG TỔNG HỢP ĐÁP ÁN (ANSWER KEY MATRIX)</div>
  <table class="answer-summary-table">
    <thead>
      <tr>
        ${questions.slice(0, 11).map((q) => `<th>Câu ${q.order_index}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${questions.slice(0, 11).map((q) => `<td><strong>${q.correct_answer}</strong></td>`).join('')}
      </tr>
    </tbody>
  </table>
  <table class="answer-summary-table">
    <thead>
      <tr>
        ${questions.slice(11, 22).map((q) => `<th>Câu ${q.order_index}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${questions.slice(11, 22).map((q) => `<td><strong>${q.correct_answer}</strong></td>`).join('')}
      </tr>
    </tbody>
  </table>
  <div style="font-weight: bold; margin: 14px 0 4px 0; font-size: 12pt;">II. HƯỚNG DẪN GIẢI CHI TIẾT TỪNG CÂU</div>
  `
      : ''
  }

  <!-- PHẦN I: MULTIPLE CHOICE -->
  <div class="section-header">
    PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (12 CÂU – 6.0 ĐIỂM)
    <span style="font-size: 10pt; font-weight: normal; text-transform: none; display: block;">
      (Thí sinh chọn 01 phương án đúng duy nhất cho mỗi câu hỏi)
    </span>
  </div>

  ${part1
    .map((q) => {
      const qEn = renderLatexToHtml(q.question_en);
      const qVi = q.question_vi ? renderLatexToHtml(q.question_vi) : '';
      const opts = (q.options_en || []).map((opt) => renderLatexToHtml(opt));
      const solEn = q.solution_en ? renderLatexToHtml(q.solution_en) : '';
      const solVi = q.solution_vi ? renderLatexToHtml(q.solution_vi) : '';

      return `
      <div class="question-item">
        <div class="question-en">
          <span class="question-label">Question ${q.order_index}:</span> ${qEn}
        </div>
        ${qVi ? `<div class="question-vi"><em>Bản dịch tham khảo:</em> ${qVi}</div>` : ''}
        
        <div class="options-grid">
          ${opts.map((opt) => `<div class="option-cell">${opt}</div>`).join('')}
        </div>

        ${
          isSolution
            ? `
        <div class="solution-box">
          <div class="sol-ans">✓ Đáp án đúng: ${q.correct_answer}</div>
          <div><strong>Solution:</strong> ${solEn}</div>
          ${solVi ? `<div style="margin-top: 4px; color: #333;"><strong>Lời giải tiếng Việt:</strong> ${solVi}</div>` : ''}
        </div>
        `
            : ''
        }
      </div>
    `;
    })
    .join('')}

  <!-- PHẦN II: SHORT ANSWER -->
  <div class="section-header" style="page-break-before: auto;">
    PHẦN II. CÂU HỎI TRẢ LỜI NGẮN (10 CÂU – 14.0 ĐIỂM)
    <span style="font-size: 10pt; font-weight: normal; text-transform: none; display: block;">
      (Thí sinh viết câu trả lời hoặc số/biểu thức đáp số vào ô quy định)
    </span>
  </div>

  ${part2
    .map((q) => {
      const qEn = renderLatexToHtml(q.question_en);
      const qVi = q.question_vi ? renderLatexToHtml(q.question_vi) : '';
      const solEn = q.solution_en ? renderLatexToHtml(q.solution_en) : '';
      const solVi = q.solution_vi ? renderLatexToHtml(q.solution_vi) : '';

      return `
      <div class="question-item">
        <div class="question-en">
          <span class="question-label">Question ${q.order_index}:</span> ${qEn}
        </div>
        ${qVi ? `<div class="question-vi"><em>Bản dịch tham khảo:</em> ${qVi}</div>` : ''}
        
        ${
          !isSolution
            ? `
        <div class="short-answer-line">
          <strong>Đáp số:</strong> ................................................................ <span class="answer-box"></span>
        </div>
        `
            : ''
        }

        ${
          isSolution
            ? `
        <div class="solution-box">
          <div class="sol-ans">✓ Đáp số chuẩn: ${q.correct_answer} ${q.acceptable_answers ? `(Chấp nhận: ${q.acceptable_answers.join(', ')})` : ''}</div>
          <div><strong>Solution:</strong> ${solEn}</div>
          ${solVi ? `<div style="margin-top: 4px; color: #333;"><strong>Lời giải tiếng Việt:</strong> ${solVi}</div>` : ''}
        </div>
        `
            : ''
        }
      </div>
    `;
    })
    .join('')}

  <div class="footer-note">
    ${
      !isSolution
        ? '---------- CÁN BỘ COI THI KHÔNG GIẢI THÍCH GÌ THÊM. THÍ SINH KHÔNG ĐƯỢC DÙNG TÀI LIỆU ----------'
        : '---------- HẾT HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN ----------'
    }
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  // Mở popup in ấn
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  } else {
    // Fallback: nếu browser chặn popup, in trang hiện tại
    const originalTitle = document.title;
    document.title = pageTitle;
    window.print();
    document.title = originalTitle;
  }
}

/**
 * Giữ hàm cũ để tương thích ngược
 */
export function printExamOrNotes(title: string): void {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  document.title = originalTitle;
}
