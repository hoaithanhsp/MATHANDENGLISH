import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer parses and renders mixed text containing Markdown & LaTeX formulas:
 * - Block math: $$ ... $$ or \[ ... \]
 * - Inline math: $ ... $ or \( ... \)
 * - Markdown Headers: #, ##, ###, #### → Styled semantic headings (removes # symbols)
 * - Markdown Lists: *, -, • → Clean bullet points (removes * symbols)
 * - Markdown Formatting: **bold** → <strong>, *italic* → <em>, `code` → <code>
 * - Horizontal rules: --- → styled divider
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Step 0: Normalize and prepare content with auto-wrapping for naked LaTeX formulas
    let cleanedContent = autoWrapNakedLatex(content);

    // Step 1: Extract and render KaTeX formulas to safe protected placeholders
    const mathTokens: string[] = [];
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([^\n]+?\\\))/g;

    const textWithPlaceholders = cleanedContent.replace(tokenRegex, (match) => {
      const isBlock = (match.startsWith('$$') && match.endsWith('$$')) || (match.startsWith('\\[') && match.endsWith('\\]'));
      const isParenInline = match.startsWith('\\(') && match.endsWith('\\)');

      let rawMath = isBlock ? match.slice(2, -2).trim() : isParenInline ? match.slice(2, -2).trim() : match.slice(1, -1).trim();
      rawMath = fixDoubleEscapes(rawMath);

      try {
        const rendered = katex.renderToString(rawMath, {
          displayMode: isBlock,
          throwOnError: false,
          output: 'html',
        });
        const index = mathTokens.length;
        mathTokens.push(
          isBlock
            ? `<div class="katex-display-wrapper my-3 overflow-x-auto py-1 text-center">${rendered}</div>`
            : `<span class="katex-inline-wrapper">${rendered}</span>`
        );
        return `@@@KATEXMATH${index}TOKEN@@@`;
      } catch {
        const index = mathTokens.length;
        mathTokens.push(`<span class="text-rose-500 font-mono text-xs">[LaTeX Error: ${escapeHtml(rawMath)}]</span>`);
        return `@@@KATEXMATH${index}TOKEN@@@`;
      }
    });

    // Step 2: Normalize literal string escapes (\n, \r\n, \r) in text outside math formulas
    // Any \n that is not a known LaTeX math command (e.g. \neq, \notin, \nabla) is converted to real newline
    let normalizedText = textWithPlaceholders
      .replace(/\\r\\n/g, '\n')
      .replace(/\\r/g, '\n')
      .replace(/\\+n(?!(nabla|natural|neg|neq|ne|nearrow|nexists|notin|normalsize|nu|null|nwarrow|nRightarrow|nLeftarrow)\b)/g, '\n');

    // Normalize bullet point lines: ensure a space after bullet markers (-, *, •)
    normalizedText = normalizedText.replace(/(^|\n)\s*[\*\-•]\s*/g, '$1- ');

    // Step 2: If inline mode, just format inline bold/italic and restore math
    if (inline) {
      let inlineText = normalizedText.replace(/\n+/g, ' ');
      let escaped = escapeHtml(inlineText);
      escaped = formatInlineStyles(escaped);
      for (let i = 0; i < mathTokens.length; i++) {
        escaped = escaped.split(`@@@KATEXMATH${i}TOKEN@@@`).join(mathTokens[i]);
      }
      return escaped;
    }

    // Step 3: Block mode — full Markdown to beautiful HTML parser
    const lines = normalizedText.split('\n');
    const parsedHtmlChunks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Empty lines
      if (!trimmed) {
        parsedHtmlChunks.push('<div class="h-2"></div>');
        continue;
      }

      // Horizontal rules (--- or *** or ___)
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        parsedHtmlChunks.push('<hr class="my-4 border-t border-slate-200 dark:border-slate-700" />');
        continue;
      }

      // Heading 1: # Title (Main Lesson Title)
      if (/^#\s+(.+)$/.test(trimmed)) {
        const titleText = escapeHtml(trimmed.replace(/^#\s+/, ''));
        parsedHtmlChunks.push(
          `<h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 pb-2 border-b border-teal-200 dark:border-teal-900/60 tracking-tight leading-snug">${formatInlineStyles(titleText)}</h2>`
        );
        continue;
      }

      // Heading 2: ## Subtitle (Bilingual topic / major section)
      if (/^##\s+(.+)$/.test(trimmed)) {
        const subText = escapeHtml(trimmed.replace(/^##\s+/, ''));
        parsedHtmlChunks.push(
          `<h3 class="text-base sm:text-lg font-bold text-teal-700 dark:text-teal-300 mt-4 mb-2 tracking-tight">${formatInlineStyles(subText)}</h3>`
        );
        continue;
      }

      // Heading 3: ### 1. Section Title
      if (/^###\s+(.+)$/.test(trimmed)) {
        const h3Text = escapeHtml(trimmed.replace(/^###\s+/, ''));
        parsedHtmlChunks.push(
          `<h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block shadow-xs"></span><span class="flex-1">${formatInlineStyles(h3Text)}</span></h4>`
        );
        continue;
      }

      // Heading 4: #### 1.1. Subsection Title
      if (/^####\s+(.+)$/.test(trimmed)) {
        const h4Text = escapeHtml(trimmed.replace(/^####\s+/, ''));
        parsedHtmlChunks.push(
          `<h5 class="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-3 mb-1.5 pl-3 border-l-4 border-emerald-500 py-0.5">${formatInlineStyles(h4Text)}</h5>`
        );
        continue;
      }

      // Heading 5+: ##### Other Title
      if (/^#####+\s+(.+)$/.test(trimmed)) {
        const h5Text = escapeHtml(trimmed.replace(/^#####+\s+/, ''));
        parsedHtmlChunks.push(
          `<h6 class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2.5 mb-1 pl-2.5 border-l-2 border-teal-400">${formatInlineStyles(h5Text)}</h6>`
        );
        continue;
      }

      // Blockquotes (> Quote)
      if (/^>\s+(.+)$/.test(trimmed)) {
        const quoteText = escapeHtml(trimmed.replace(/^>\s+/, ''));
        parsedHtmlChunks.push(
          `<blockquote class="p-3 my-2 border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/25 text-slate-700 dark:text-slate-300 rounded-r-xl text-xs sm:text-sm leading-relaxed">${formatInlineStyles(quoteText)}</blockquote>`
        );
        continue;
      }

      // Bullet points (* item, - item, • item) — Remove the ugly * symbol!
      if (/^[\*\-•]\s+(.+)$/.test(trimmed)) {
        const itemText = escapeHtml(trimmed.replace(/^[\*\-•]\s+/, ''));
        parsedHtmlChunks.push(
          `<div class="flex items-start gap-2.5 my-1.5 pl-2"><span class="text-emerald-500 font-bold mt-1 shrink-0 text-sm leading-none select-none">•</span><div class="flex-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs sm:text-sm">${formatInlineStyles(itemText)}</div></div>`
        );
        continue;
      }

      // Numbered items (1. item, 2. item)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        const num = numMatch[1];
        const numText = escapeHtml(numMatch[2]);
        parsedHtmlChunks.push(
          `<div class="flex items-start gap-2.5 my-1.5 pl-2"><span class="font-bold text-teal-600 dark:text-teal-400 shrink-0 text-xs sm:text-sm mt-0.5 min-w-[1.25rem]">${num}.</span><div class="flex-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs sm:text-sm">${formatInlineStyles(numText)}</div></div>`
        );
        continue;
      }

      // Standard paragraph line
      const escapedLine = escapeHtml(trimmed);
      parsedHtmlChunks.push(
        `<p class="leading-relaxed text-slate-700 dark:text-slate-300 my-1 text-xs sm:text-sm">${formatInlineStyles(escapedLine)}</p>`
      );
    }

    let finalHtml = parsedHtmlChunks.join('');

    // Step 4: Restore all KaTeX placeholders
    for (let i = 0; i < mathTokens.length; i++) {
      finalHtml = finalHtml.split(`@@@KATEXMATH${i}TOKEN@@@`).join(mathTokens[i]);
    }

    return finalHtml;
  }, [content, inline]);

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
      className={`math-rendered-block space-y-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

/**
 * Parses inline markdown:
 * - **bold** or __bold__ → <strong> (removes ** symbols)
 * - *italic* or _italic_ → <em> (removes * symbols)
 * - `code` → <code>
 */
function formatInlineStyles(text: string): string {
  // Bold: **text** or __text__
  let res = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  res = res.replace(/__(.+?)__/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');

  // Italic: *text* or _text_ (when not part of bold)
  res = res.replace(/(^|[^\*])\*([^\*\s][^\*]*?)\*([^\*]|$)/g, '$1<em class="italic text-slate-700 dark:text-slate-300">$2</em>$3');
  res = res.replace(/(^|[^_])_([^_\s][^_]*?)_([^_]|$)/g, '$1<em class="italic text-slate-700 dark:text-slate-300">$2</em>$3');

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-mono text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">$1</code>');

  return res;
}

/**
 * Fix double-escaped backslashes that come from JSON/Firebase strings.
 * Examples: \\sin → \sin, \\frac → \frac, \\sqrt → \sqrt
 * Also handles: \\\\sin → \\sin (quadruple to double)
 */
function fixDoubleEscapes(math: string): string {
  let result = math.replace(/\\\\\\\\/g, '\\\\');
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

/**
 * Automatically wraps naked LaTeX formulas that are missing $...$ or $$...$$ delimiters.
 * Ensures that expressions like "\frac{64\sqrt{3}}{9}", "A. \frac{64\sqrt{3}}{9}", or "-\frac{1}{2}"
 * are safely wrapped in KaTeX inline delimiters ($...$).
 */
function autoWrapNakedLatex(content: string): string {
  if (!content) return '';

  // 1. Temporarily protect existing properly wrapped math ($...$, $$...$$, \[...\], \(...\))
  const protectedMath: string[] = [];
  const existingMathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([^\n]+?\\\))/g;

  let workingText = content.replace(existingMathRegex, (match) => {
    const idx = protectedMath.length;
    protectedMath.push(match);
    return `@@@ALREADY_PROTECTED_${idx}@@@`;
  });

  // 2. Comprehensive regex for common LaTeX mathematical commands
  const mathCommandRegex = /\\(frac|dfrac|tfrac|cfrac|sqrt|cbrt|binom|vec|mathbf|mathbb|mathcal|mathrm|mathit|text|textbf|textit|left|right|big|Big|bigg|Bigg|sum|prod|coprod|int|iint|iiint|oint|lim|limsup|liminf|min|max|inf|sup|gcd|deg|exp|ln|log|sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|coth|arcsin|arccos|arctan|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|cdot|times|div|pm|mp|circ|bullet|cap|cup|uplus|wedge|vee|setminus|le|ge|leq|geq|ne|neq|ll|gg|approx|sim|simeq|cong|equiv|propto|perp|mid|parallel|subset|supset|subseteq|supseteq|in|ni|notin|forall|exists|nexists|neg|not|to|rightarrow|leftarrow|Rightarrow|Leftarrow|iff|Longleftrightarrow|implies|mapsto|partial|nabla|infty|angle|triangle|square|prime|emptyset|varnothing|top|bot|cdots|ldots|ddots|vdots|over)\b/;

  const trimmed = workingText.trim();

  // Case A: Multiple choice option prefix like "A. \frac{64\sqrt{3}}{9}" or "A. 2\sqrt{3}"
  const optionPrefixMatch = trimmed.match(/^([A-D]\.\s*)(.+)$/);
  if (optionPrefixMatch) {
    const prefix = optionPrefixMatch[1];
    const body = optionPrefixMatch[2].trim();
    if ((mathCommandRegex.test(body) || /[\\^_{}]/.test(body)) && !body.includes('@@@ALREADY_PROTECTED_')) {
      workingText = `${prefix}$${body}$`;
    }
  }
  // Case B: Entire trimmed content is a naked LaTeX math expression (like "\frac{64\sqrt{3}}{9}" or "-\frac{32\sqrt{3}}{9}")
  else if (
    !trimmed.includes('\n') &&
    !trimmed.includes('@@@ALREADY_PROTECTED_') &&
    (mathCommandRegex.test(trimmed) || (trimmed.startsWith('\\') && trimmed.length > 2))
  ) {
    workingText = `$${trimmed}$`;
  }
  // Case C: Mixed text containing naked LaTeX expressions (e.g. "Find m so that \frac{x+1}{x-1} > 0")
  else if (mathCommandRegex.test(workingText)) {
    const nakedFormulaRegex = /((?:[-+]?\s*)?\\(?:frac|dfrac|tfrac|cfrac|sqrt|cbrt|binom|vec|sum|prod|int|lim|sin|cos|tan|log|ln|alpha|beta|gamma|pi|theta|infty|le|ge|neq|pm|times|div|cdot|in|to|left|right)[a-zA-Z0-9\s\\\{\}\[\]\^\_\+\-\*\/\=\<\>\(\)\,\.\:]+?)(?=[,;.?!]?(?:\s+[a-zA-Z\u00C0-\u1EF9]{2,}|\s*$|\n))/g;
    workingText = workingText.replace(nakedFormulaRegex, (m) => {
      if (m.includes('@@@ALREADY_PROTECTED_')) return m;
      return `$${m.trim()}$`;
    });
  }

  // 3. Restore protected tokens
  for (let i = 0; i < protectedMath.length; i++) {
    workingText = workingText.split(`@@@ALREADY_PROTECTED_${i}@@@`).join(protectedMath[i]);
  }

  return workingText;
}

export default MathRenderer;
