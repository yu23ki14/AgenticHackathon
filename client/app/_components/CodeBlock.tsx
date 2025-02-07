import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
 
export default function CodeBlock({ inline, className, children }: any) {
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const match = /language-(\w+)/.exec(className || '');
  if (!match) {
    return <code className={className}>{children}</code>;
  }

  const lang = match && match[1] ? match[1] : '';

  return (
    <SyntaxHighlighter
      style={atomDark}
      language={lang}
      customStyle={{ whiteSpace: 'pre-wrap' }}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
}
