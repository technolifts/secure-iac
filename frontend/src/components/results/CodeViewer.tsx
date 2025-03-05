/**
 * Code viewer component
 *
 * This component displays formatted code with syntax highlighting.
 */

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'terraform' }) => {
  return (
    <div className="rounded-lg overflow-hidden bg-gray-800">
      <SyntaxHighlighter 
        language={language} 
        style={tomorrow}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.9rem',
          lineHeight: '1.5',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeViewer;