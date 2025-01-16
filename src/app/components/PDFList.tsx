import React from "react";

type PDF = {
  id: number;
  description: string;
  created_at: number;
  file: {
    name: string;
    size: number;
    url: string;
  };
};

type PDFListProps = {
  pdfs: PDF[];
  onDelete: (id: number) => void;
};

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString();

const formatSize = (size: number) =>
  `${(size / 1024 / 1024).toFixed(2)} MB`;

const PDFList: React.FC<PDFListProps> = ({ pdfs, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Uploaded PDFs</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Size</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pdfs.map((pdf) => (
            <tr key={pdf.id} className="hover:bg-gray-50">
              <td className="p-2 border">
                <a
                  href={pdf.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {pdf.file.name}
                </a>
              </td>
              <td className="p-2 border">{pdf.description}</td>
              <td className="p-2 border">{formatSize(pdf.file.size)}</td>
              <td className="p-2 border">{formatDate(pdf.created_at)}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => onDelete(pdf.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PDFList;
