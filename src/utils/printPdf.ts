import { Exam } from '../types';

/**
 * Triggers window.print() formatted with high quality styling
 */
export function printExamOrNotes(title: string): void {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  document.title = originalTitle;
}
