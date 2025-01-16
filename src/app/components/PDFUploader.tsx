import React, { useState } from "react";

type PDFUploaderProps = {
  onUpload: (file: File) => void;
};

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      setFile(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Upload New PDF</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={!file}
      >
        Upload
      </button>
    </div>
  );
};

export default PDFUploader;
