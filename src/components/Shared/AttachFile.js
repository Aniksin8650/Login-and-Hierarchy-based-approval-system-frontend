import React, { useRef } from "react";

export default function AttachFile({
  files = [],
  onChange = () => {},
  maxFiles = 5,
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  namePattern = /^[a-zA-Z0-9_\s-]{3,20}$/,
  maxFileSize = 5 * 1024 * 1024,
  label = "Attach File",
  required = false,
  showThumbnails = true,
  accept = ".pdf,.jpg,.jpeg,.png",
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = [];

    const existingCount = files.length;
    if (existingCount + selectedFiles.length > maxFiles) {
      alert(`You can attach up to ${maxFiles} files.`);
      e.target.value = "";
      return;
    }

    selectedFiles.forEach((sf) => {
      if (!allowedTypes.includes(sf.type)) {
        alert(`${sf.name} is not allowed. Only PDF, JPG, PNG accepted.`);
        return;
      }

      const baseName = sf.name.split(".")[0];
      if (!namePattern.test(baseName)) {
        alert(
          `Invalid file name "${sf.name}". Must be letters/numbers/dash/underscore, 3–20 chars.`
        );
        return;
      }

      if (sf.size > maxFileSize) {
        alert(
          `${sf.name} is too big. Max ${Math.round(
            maxFileSize / 1024 / 1024
          )} MB allowed.`
        );
        return;
      }

      if (files.some((f) => f.name === sf.name)) {
        alert(`File "${sf.name}" already added.`);
        return;
      }

      validFiles.push(sf);
    });

    if (validFiles.length > 0) {
      onChange([...files, ...validFiles]);
    }

    e.target.value = "";
  };

  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const renderPreview = (fileObj, index) => {
    if (fileObj.isServerFile) {
      const isPdf = fileObj.name.toLowerCase().endsWith(".pdf");

      return (
        <div key={index} className="file-preview">
          <a
            href={fileObj.url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
          >
            {isPdf ? (
              <p className="file-name">{fileObj.name}</p>
            ) : showThumbnails ? (
              <img src={fileObj.url} alt={fileObj.name} className="file-thumb" />
            ) : (
              <p className="file-name">{fileObj.name}</p>
            )}
          </a>
          <button
            type="button"
            className="remove-btn"
            onClick={() => handleRemove(index)}
          >
            Remove
          </button>
        </div>
      );
    }

    const url = URL.createObjectURL(fileObj);
    const isPdf = fileObj.name.toLowerCase().endsWith(".pdf");

    return (
      <div key={index} className="file-preview">
        <a href={url} target="_blank" rel="noopener noreferrer" className="file-link">
          {isPdf ? (
            <p className="file-name">{fileObj.name}</p>
          ) : showThumbnails ? (
            <img src={url} alt={fileObj.name} className="file-thumb" />
          ) : (
            <p className="file-name">{fileObj.name}</p>
          )}
        </a>
        <button
          type="button"
          className="remove-btn"
          onClick={() => handleRemove(index)}
        >
          Remove
        </button>
      </div>
    );
  };

  return (
    <div className="attach-section-component">
      <div className="attach-controls">
          <button
               type="button"
               className="attach-btn"
               onClick={() => fileInputRef.current && fileInputRef.current.click()}
               >
               {files.length === 0 ? label : "Add More"}
          </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          multiple
          accept={accept}
          onChange={handleFileSelect}
        />

        {required && files.length === 0 && (
          <small className="required-note">* Required</small>
        )}
      </div>

      {files.length > 0 && (
        <div className="file-preview-list">
          {files.map((f, i) => renderPreview(f, i))}
        </div>
      )}
    </div>
  );
}
