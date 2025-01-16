import React, { useState } from "react";

type PDFUploaderProps = {
  onUpload: (description: string, file: File) => void;
  onClose: () => void;
};

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload, onClose }) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (description && file) {
      onUpload(description, file);
      setDescription("");
      setFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">
          Upload New PDF
        </h2>
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-textPrimary px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="bg-textImportant text-white px-4 py-2 rounded"
            disabled={!description || !file}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
