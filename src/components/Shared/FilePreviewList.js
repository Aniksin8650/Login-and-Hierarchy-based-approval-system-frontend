// src/components/Shared/FilePreviewList.js
import React from "react";

function FilePreviewList({ files = [] }) {
  if (!files.length) return <span>-</span>;

  return (
    <div className="file-preview-list">
      {files.map((f, idx) => (
        <div key={idx} className="file-preview-item">
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {f.name}
          </a>
        </div>
      ))}
    </div>
  );
}

export default FilePreviewList;
