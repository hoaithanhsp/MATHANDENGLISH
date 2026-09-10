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

    // Step 1: Extract and render KaTeX formulas to protected placeholders
    const mathTokens: string[] = [];
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([^\n]+?\\\))/g;

    const textWithPlaceholders = content.replace(tokenRegex, (match) => {
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
        return `%%%MATH_PLACEHOLDER_${index}%%%`;
      } catch {
        const index = mathTokens.length;
        mathTokens.push(`<span class="text-rose-500 font-mono text-xs">[LaTeX Error: ${escapeHtml(rawMath)}]</span>`);
        return `%%%MATH_PLACEHOLDER_${index}%%%`;
      }
    });

    // Step 2: If inline mode, just format inline bold/italic and restore math
    if (inline) {
      let escaped = escapeHtml(textWithPlaceholders);
      escaped = formatInlineStyles(escaped);
      for (let i = 0; i < mathTokens.length; i++) {
        escaped = escaped.split(`%%%MATH_PLACEHOLDER_${i}%%%`).join(mathTokens[i]);
      }
      return escaped;
    }

    // Step 3: Block mode — full Markdown to beautiful HTML parser
    const lines = textWithPlaceholders.split('\n');
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
          `<h2 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 pb-2 border-b border-indigo-200 dark:border-indigo-900/60 tracking-tight leading-snug">${formatInlineStyles(titleText)}</h2>`
        );
        continue;
      }

      // Heading 2: ## Subtitle (Bilingual topic / major section)
      if (/^##\s+(.+)$/.test(trimmed)) {
        const subText = escapeHtml(trimmed.replace(/^##\s+/, ''));
        parsedHtmlChunks.push(
          `<h3 class="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-4 mb-2 tracking-tight">${formatInlineStyles(subText)}</h3>`
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
          `<h6 class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2.5 mb-1 pl-2.5 border-l-2 border-indigo-400">${formatInlineStyles(h5Text)}</h6>`
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
          `<div class="flex items-start gap-2.5 my-1.5 pl-2"><span class="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 text-xs sm:text-sm mt-0.5 min-w-[1.25rem]">${num}.</span><div class="flex-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs sm:text-sm">${formatInlineStyles(numText)}</div></div>`
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
      finalHtml = finalHtml.split(`%%%MATH_PLACEHOLDER_${i}%%%`).join(mathTokens[i]);
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
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">$1</code>');

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

export default MathRenderer;
