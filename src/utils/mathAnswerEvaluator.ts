/**
 * Math Answer Evaluator — Bộ Quy Tắc Chuẩn Hóa và Đánh Giá Đáp Án Ngắn Phần II
 * Hỗ trợ nhận diện tương đương: phân số, số thập phân, dấu phẩy tiếng Việt, và chấp nhận danh sách đáp án mở rộng.
 */

export interface MathEvalResult {
  isCorrect: boolean;
  normalizedStudent: string;
  normalizedCorrect: string;
  numericMatch: boolean;
}

/**
 * Parses a numeric value from string (integer, decimal, or fraction 'a/b')
 */
export function parseNumericValue(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/,/g, '.').replace(/\s+/g, '');

  // Case 1: Simple decimal or integer (e.g. "42", "-5.5", "0.25")
  if (/^-?\d+(?:\.\d+)?$/.test(cleaned)) {
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Case 2: Fraction format "a/b" or "-a/b"
  const fractionMatch = cleaned.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator === 0) return null;
    return numerator / denominator;
  }

  return null;
}

/**
 * Normalizes an answer string for exact/lexical comparison
 */
export function normalizeAnswerString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .replace(/^\$+|\$+$/g, '') // remove surrounding LaTeX dollar signs
    .replace(/[()]/g, '');     // remove outer parentheses
}

/**
 * Evaluates whether a student's answer matches the correct answer
 * Considers both exact string equality and mathematical numerical equivalence.
 */
export function evaluateMathAnswer(
  studentAns: string | undefined | null,
  correctAns: string | undefined | null,
  acceptableAnswers?: string[] | null
): MathEvalResult {
  const normStudent = normalizeAnswerString(studentAns || '');
  const normCorrect = normalizeAnswerString(correctAns || '');

  // 1. Direct lexical match
  if (normStudent && normStudent === normCorrect) {
    return {
      isCorrect: true,
      normalizedStudent: normStudent,
      normalizedCorrect: normCorrect,
      numericMatch: true,
    };
  }

  // 2. Check acceptable answers list if provided by teacher/exam
  if (acceptableAnswers && acceptableAnswers.length > 0) {
    for (const alt of acceptableAnswers) {
      const normAlt = normalizeAnswerString(alt);
      if (normStudent && normStudent === normAlt) {
        return {
          isCorrect: true,
          normalizedStudent: normStudent,
          normalizedCorrect: normCorrect,
          numericMatch: true,
        };
      }
    }
  }

  // 3. Mathematical Equivalence Check (Fraction vs Decimal, e.g. 1/2 == 0.5)
  const studentNum = parseNumericValue(normStudent);
  const correctNum = parseNumericValue(normCorrect);

  if (studentNum !== null && correctNum !== null) {
    // Within small floating point epsilon
    const diff = Math.abs(studentNum - correctNum);
    if (diff < 1e-5) {
      return {
        isCorrect: true,
        normalizedStudent: normStudent,
        normalizedCorrect: normCorrect,
        numericMatch: true,
      };
    }
  }

  // Also check numeric match against acceptable answers
  if (studentNum !== null && acceptableAnswers && acceptableAnswers.length > 0) {
    for (const alt of acceptableAnswers) {
      const altNum = parseNumericValue(alt);
      if (altNum !== null && Math.abs(studentNum - altNum) < 1e-5) {
        return {
          isCorrect: true,
          normalizedStudent: normStudent,
          normalizedCorrect: normCorrect,
          numericMatch: true,
        };
      }
    }
  }

  return {
    isCorrect: false,
    normalizedStudent: normStudent,
    normalizedCorrect: normCorrect,
    numericMatch: false,
  };
}

export function isMathAnswerCorrect(
  studentAns: string | undefined | null,
  correctAns: string | undefined | null,
  acceptableAnswers?: string[] | null
): boolean {
  return evaluateMathAnswer(studentAns, correctAns, acceptableAnswers).isCorrect;
}

export default evaluateMathAnswer;

