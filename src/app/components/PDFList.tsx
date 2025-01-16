import React from "react";

type PDF = {
  id: number;
  name: string;
  url: string;
};

type PDFListProps = {
  pdfs: PDF[];
  onDelete: (id: number) => void;
};

const PDFList: React.FC<PDFListProps> = ({ pdfs, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Uploaded PDFs</h2>
      {pdfs.length > 0 ? (
        <ul>
          {pdfs.map((pdf) => (
            <li
              key={pdf.id}
              className="flex justify-between items-center py-2 border-b"
            >
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {pdf.name}
              </a>
              <button
                onClick={() => onDelete(pdf.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No PDFs uploaded yet.</p>
      )}
    </div>
  );
};

export default PDFList;
