import React, { useState } from "react";

type PDFUploaderProps = {
  onUpload: (description: string, file: File) => void;
};

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (description && file) {
      onUpload(description, file);
      setDescription("");
      setFile(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload New PDF</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="w-full"
        />
      </div>
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={!description || !file}
      >
        Upload
      </button>
    </div>
  );
};

export default PDFUploader;
