import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TruncatedMessage = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 200; // characters before "Read more" shows

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = expanded ? text : text.slice(0, limit);

  return (
    <div className="text-gray-100 leading-relaxed text-sm">
      <div
        className={`prose prose-sm prose-invert max-w-none overflow-hidden text-xs transition-all duration-500 ${
          expanded ? "max-h-[2000px]" : "max-h-[150px]"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            li: ({ children }) => (
              <li className="ml-4 list-disc text-xs">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-green-400 text-xs">{children}</strong>
            ),
          }}
        >
          {displayText}
        </ReactMarkdown>
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-400 hover:underline mt-1 text-xs"
        >
          {expanded ? "Read less ▲" : "Read more ▼"}
        </button>
      )}
    </div>
  );
};

export default TruncatedMessage;
