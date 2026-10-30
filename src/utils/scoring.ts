/**
 * Thang điểm 10 theo Cấu trúc đề thi HSG Toán bằng tiếng Anh — Sở GD&ĐT Hải Phòng.
 * Cấu trúc gốc không nêu điểm từng câu; app giữ tỉ trọng cũ (Phần I 30%, Phần II 70%):
 *   Phần I : 12 câu × 0,25 = 3,0 điểm
 *   Phần II: 10 câu × 0,70 = 7,0 điểm
 * Bài làm lưu trước khi đổi thang (không có score_scale) được tính theo thang 20 → chia 2.
 */
import { Assignment, ExamSession, Question } from '../types';

export const SCORE_SCALE = 10;
export const PART1_POINTS = 0.25;
export const PART2_POINTS = 0.7;
const LEGACY_SCALE = 20;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Điểm thang 10 cho một lượt làm bài. Đề không đúng cấu trúc 12 + 10 câu → tính theo tỉ lệ câu đúng. */
export function computeScore(questions: Question[], part1Correct: number, part2Correct: number): number {
  const part1Total = questions.filter((q) => q.part === 'PART_1').length;
  const part2Total = questions.length - part1Total;
  if (part1Total === 12 && part2Total === 10) {
    return round2(part1Correct * PART1_POINTS + part2Correct * PART2_POINTS);
  }
  return questions.length > 0 ? round2(((part1Correct + part2Correct) / questions.length) * SCORE_SCALE) : 0;
}

/** Quy đổi điểm đã lưu về thang 10 (điểm cũ không ghi thang được coi là thang 20). */
export function toScale10(score: number | undefined, scale?: number): number | undefined {
  if (typeof score !== 'number' || Number.isNaN(score)) return score;
  if (scale === SCORE_SCALE) return score;
  return round2((score * SCORE_SCALE) / (scale || LEGACY_SCALE));
}

export function normalizeAssignment(a: Assignment): Assignment {
  if (!a || a.score_scale === SCORE_SCALE || typeof a.score !== 'number') return a;
  return { ...a, score: toScale10(a.score, a.score_scale), score_scale: SCORE_SCALE };
}

export function normalizeSession(s: ExamSession): ExamSession {
  if (!s || s.score_scale === SCORE_SCALE || typeof s.score !== 'number') return s;
  return { ...s, score: toScale10(s.score, s.score_scale), score_scale: SCORE_SCALE };
}

export const formatScore = (score: number | undefined) => `${(score ?? 0).toFixed(2)}/${SCORE_SCALE}`;
