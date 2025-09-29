import React from "react";
import Editor from "@monaco-editor/react";

const SimpleEditor: React.FC = () => {
  return (
    <div style={{ height: "500px", border: "1px solid #ccc" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Start coding here..."
        theme="vs-dark"
      />
    </div>
  );
};

export default SimpleEditor;
