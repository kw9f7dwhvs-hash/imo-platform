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
    // Extract math blocks and replace with placeholders
    let result = content;
    const placeholders: string[] = [];
    let phIdx = 0;
    const saveMath = (block: string) => {
      const ph = '%%MATH' + (phIdx++) + '%%';
      placeholders.push(block);
      return ph;
    };
    // Block math: $$...$$
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => saveMath(math));
    // Block math: \[...\]
    result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => saveMath(math));
    // Inline math: $...$
    result = result.replace(/\$([^\$]+?)\$/g, (_, math) => saveMath(math));
    // Inline math: \(...\)
    result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => saveMath(math));
    
    // Now process newlines in the remaining text
    // Double newlines → paragraph break
    result = '<p>' + result.replace(/\n\n+/g, '</p><p>') + '</p>';
    // Single newlines → <br/>
    result = result.replace(/\n/g, '<br/>');
    
    // Restore math placeholders
    let phI = 0;
    while (result.includes('%%MATH')) {
      result = result.replace('%%MATH' + phI + '%%', () => {
        const math = placeholders[phI];
        phI++;
        const isDisplay = math.includes('\n') || math.length > 80;
        try {
          return katex.renderToString(math.trim(), { displayMode: isDisplay, throwOnError: false });
        } catch {
          return '<span class="text-red-500">LaTeX error: ' + math + '</span>';
        }
      });
    }
    return result;
  }, [content]);

  if (!content) return null;
  return <div className={'prose prose-sm max-w-none ' + className} dangerouslySetInnerHTML={{ __html: html }} />;
}
