'use client';
import { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    let result = content;
    // Block math: $$...$$
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch { return '<span class="text-red-500">LaTeX error: ' + math + '</span>'; }
    });
    // Inline math: $...$
    result = result.replace(/\$([^\$]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch { return '<span class="text-red-500">$' + math + '$</span>'; }
    });
    return result;
  }, [content]);

  if (!content) return null;
  return <div className={'prose prose-sm max-w-none ' + className} dangerouslySetInnerHTML={{ __html: html }} />;
}
