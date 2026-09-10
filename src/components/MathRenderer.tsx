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
 *
 * Handles double-escaped backslashes from JSON/TS strings:
 *   \\sin → \sin, \\frac → \frac, etc.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Pre-process: fix double-escaped LaTeX backslashes
    // In TS string literals, \\sin becomes the string "\sin" which is correct.
    // But if the string literally contains "\\sin" (two chars: backslash + backslash + sin),
    // we need to reduce it to "\sin" for KaTeX.
    let processed = content;

    // Regex to match $$ ... $$, \[ ... \], $ ... $, or \( ... \)
    // Avoid false positives like isolated $ signs
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([^\n]+?\\\))/g;
    const parts = processed.split(tokenRegex);

    return parts
      .map((part) => {
        if (!part) return '';

        // Block math: $$ ... $$ or \[ ... \]
        const isDoubleDollarBlock = part.startsWith('$$') && part.endsWith('$$') && part.length >= 4;
        const isBracketBlock = part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4;
        if (isDoubleDollarBlock || isBracketBlock) {
          let math = part.slice(2, -2).trim();
          math = fixDoubleEscapes(math);
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              output: 'html',
            });
          } catch (err) {
            return `<span class="text-rose-500 font-mono text-xs">[LaTeX Error: ${escapeHtml(math)}]</span>`;
          }
        }

        // Inline math: $ ... $ or \( ... \)
        const isDollarInline = part.startsWith('$') && part.endsWith('$') && part.length >= 2;
        const isParenInline = part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4;
        if (isDollarInline || isParenInline) {
          let math = isDollarInline ? part.slice(1, -1).trim() : part.slice(2, -2).trim();
          math = fixDoubleEscapes(math);
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              output: 'html',
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

/**
 * Fix double-escaped backslashes that come from JSON/Firebase strings.
 * Examples: \\sin → \sin, \\frac → \frac, \\sqrt → \sqrt
 * Also handles: \\\\sin → \\sin (quadruple to double)
 */
function fixDoubleEscapes(math: string): string {
  // First pass: reduce quadruple-escaped backslashes to double
  let result = math.replace(/\\\\\\\\/g, '\\\\');

  // Second pass: generalize LaTeX command reduction (\\command -> \command)
  // Replaces any \\ followed by alphabetical command name or special LaTeX symbol
  result = result.replace(/\\\\([a-zA-Z]+|[{}[\](),:;!%_#&|])/g, '\\$1');

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathRenderer;
