import React from "react";
import { PDF } from "../interfaces/pdf";

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
      <h2 className="text-lg font-semibold text-textPrimary mb-4">Uploaded PDFs</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-background">
              <th className="p-4 border text-left text-textPrimary">Name</th>
              <th className="p-4 border text-left text-textPrimary">Description</th>
              <th className="p-4 border text-left text-textPrimary">Size</th>
              <th className="p-4 border text-left text-textPrimary">Date</th>
              <th className="p-4 border text-center text-textPrimary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdfs.map((pdf) => (
              <tr key={pdf.id} className="hover:bg-background">
                <td className="p-4 border">
                  <a
                    href={pdf.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-textImportant underline"
                  >
                    {pdf.file.name}
                  </a>
                </td>
                <td className="p-4 border text-textPrimary">{pdf.description}</td>
                <td className="p-4 border text-textPrimary">{formatSize(pdf.file.size)}</td>
                <td className="p-4 border text-textPrimary">{formatDate(pdf.created_at)}</td>
                <td className="p-4 border text-center">
                  <button
                    onClick={() => onDelete(pdf.id)}
                    className="text-error hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PDFList;
