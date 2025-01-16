"use client";

import React, { useEffect, useState } from "react";
import PDFList from "../components/PDFList";
import PDFUploader from "../components/PDFUploader";
import { apiPdfs } from "../utils/api";

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

const AdminPage: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const fetchPDFs = async () => {
    const response = await apiPdfs.get("/pdfs");
    setPdfs(response.data);
  };

  const handleUpload = async (description: string, file: File) => {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("file", file);

    const response = await apiPdfs.post("/pdfs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setPdfs([...pdfs, response.data]);
  };

  const handleDelete = async (id: number) => {
    await apiPdfs.delete(`/pdfs/${id}`);
    setPdfs(pdfs.filter((pdf) => pdf.id !== id));
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold text-textImportant mb-6">
        Admin Dashboard
      </h1>
      <div className="flex flex-row-reverse">
        <button
          onClick={() => setIsUploaderOpen(true)}
          className="bg-textImportant text-white px-4 py-2 rounded mb-6"
        >
          Upload PDF
        </button>
      </div>
      <PDFList pdfs={pdfs} onDelete={handleDelete} />
      {isUploaderOpen && (
        <PDFUploader
          onUpload={handleUpload}
          onClose={() => setIsUploaderOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPage;
