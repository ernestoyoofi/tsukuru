"use client";

import CodeBlock from "@/components/mdx/CodeBlock";

function getMetaHighlight(node) {
  if (!node || typeof node !== "object") return "";
  const props = node.props || {};
  // support: highlight="1,3-5" or data-highlight or metastring like {1,3}
  if (props.highlight) return String(props.highlight);
  if (props["data-highlight"]) return String(props["data-highlight"]);
  // check className or metastring leftover
  const meta = props.metastring || props.meta || "";
  if (meta) {
    const m = String(meta).match(/\{([\d,\-\s]+)\}/);
    if (m) return m[1];
    const m2 = String(meta).match(/highlight=\{?([\d,\-\s,]+)\}?/);
    if (m2) return m2[1];
  }
  return "";
}

export default function PreBlock({ children, ...rest }) {
  // MDXRemote renders <pre><code className="language-js">{code}</code></pre>
  // so children is the <code> element
  const codeEl = Array.isArray(children) ? children[0] : children;
  const props = codeEl?.props || {};
  const className = props.className || "";
  const langMatch = String(className).match(/language-(\w+)/);
  const language = langMatch ? langMatch[1] : "";
  const highlight =
    getMetaHighlight(codeEl) || props.highlight || rest.highlight || "";

  // if it's truly a code block, delegate to CodeBlock
  if (language || String(props.children || "").includes("\n") || highlight) {
    return (
      <CodeBlock language={language} highlight={highlight}>
        {props.children}
      </CodeBlock>
    );
  }

  // fallback for inline or unknown
  return <pre {...rest}>{children}</pre>;
}
