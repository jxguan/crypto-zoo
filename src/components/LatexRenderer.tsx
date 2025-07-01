import React from 'react';
import 'katex/dist/katex.min.css';
// @ts-expect-error - react-katex types are not available
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export default function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  // Function to detect if content contains LaTeX
  const containsLatex = (text: string): boolean => {
    // Check for common LaTeX delimiters
    return /\$.*\$|\\(?:[a-zA-Z]+|\(|\)|\[|\]|\{|\})/.test(text);
  };

  // Function to split text into LaTeX and non-LaTeX parts
  const parseContent = (text: string): (string | { latex: string; display: boolean })[] => {
    const parts: (string | { latex: string; display: boolean })[] = [];
    
    // Match LaTeX expressions
    const latexRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
    let lastIndex = 0;
    let match;

    while ((match = latexRegex.exec(text)) !== null) {
      // Add text before LaTeX
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add LaTeX expression
      const latexContent = match[1] || match[2]; // $$...$$ or $...$
      const isDisplay = match[1] !== undefined; // $$...$$ is display mode
      parts.push({ latex: latexContent, display: isDisplay });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // If no LaTeX detected, return plain text
  if (!containsLatex(content)) {
    return <span className={className}>{content}</span>;
  }

  const parts = parseContent(content);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          try {
            return part.display ? (
              <BlockMath key={index} math={part.latex} />
            ) : (
              <InlineMath key={index} math={part.latex} />
            );
          } catch (error) {
            // Fallback to plain text if LaTeX parsing fails
            console.warn('LaTeX parsing error:', error);
            return <span key={index} className="text-red-500">${part.latex}$</span>;
          }
        }
      })}
    </span>
  );
} 