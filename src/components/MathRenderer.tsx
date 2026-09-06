import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer parses and renders mixed text containing LaTeX formulas:
 * - Block math: $$ ... $$
 * - Inline math: $ ... $
 * Uses KaTeX for fast rendering with safe fallback.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Regex to match $$ ... $$ (block) or $ ... $ (inline)
    // Avoid false positives like isolated $ signs
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const parts = content.split(tokenRegex);

    return parts
      .map((part) => {
        if (!part) return '';

        // Block math: $$ ... $$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const math = part.slice(2, -2).trim();
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
          } catch (err) {
            return `<span class="text-rose-500 font-mono text-xs">[LaTeX Error: ${escapeHtml(math)}]</span>`;
          }
        }

        // Inline math: $ ... $
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const math = part.slice(1, -1).trim();
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              output: 'htmlAndMathml',
            });
          } catch (err) {
            return `<span class="text-rose-500 font-mono text-xs">[LaTeX Error: ${escapeHtml(math)}]</span>`;
          }
        }

        // Standard text: preserve newlines and escape html
        return escapeHtml(part).replace(/\n/g, '<br/>');
      })
      .join('');
  }, [content]);

  if (inline) {
    return (
      <span
        className={`math-rendered-inline ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <div
      className={`math-rendered-block leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathRenderer;
