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
  // First pass: reduce \\\\ to \\ (quadruple-escaped → proper LaTeX)
  let result = math.replace(/\\\\\\\\/g, '\\\\');
  // Second pass: reduce \\ to \ for known LaTeX commands
  // Match \\commandname where commandname is a known LaTeX command
  result = result.replace(
    /\\\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|exp|lim|max|min|sup|inf|det|gcd|deg|dim|ker|hom|arg|Pr|sqrt|frac|binom|sum|prod|int|iint|iiint|oint|partial|nabla|infty|pm|mp|times|div|cdot|cdots|ldots|vdots|ddots|dots|leq|geq|neq|approx|equiv|sim|simeq|cong|propto|perp|parallel|angle|triangle|square|circ|star|bullet|diamond|oplus|otimes|forall|exists|nexists|in|notin|subset|supset|subseteq|supseteq|cap|cup|setminus|emptyset|varnothing|land|lor|lnot|neg|implies|iff|to|leftarrow|rightarrow|Leftarrow|Rightarrow|leftrightarrow|Leftrightarrow|uparrow|downarrow|mapsto|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|varepsilon|varphi|vartheta|text|textbf|textit|mathrm|mathbf|mathit|mathbb|mathcal|mathfrak|mathsf|overline|underline|hat|bar|vec|tilde|dot|ddot|widehat|widetilde|overbrace|underbrace|left|right|big|Big|bigg|Bigg|lceil|rceil|lfloor|rfloor|langle|rangle|quad|qquad|hspace|vspace|phantom|bmod|pmod|mod|operatorname|stackrel|overset|underset|boxed|color|cancel|not)\b/g,
    '\\$1'
  );
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
