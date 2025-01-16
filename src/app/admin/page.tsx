"use client";

import React, { useState } from "react";
import PDFList from "../components/PDFList";
import PDFUploader from "../components/PDFUploader";
import ConfirmationModal from "../components/ConfirmationModal";

type PDF = {
  id: number;
  name: string;
  url: string;
};

const AdminPage: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([
    // Example data; replace with API data
    { id: 1, name: "Example.pdf", url: "/example.pdf" },
  ]);
  const [selectedPdfId, setSelectedPdfId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: number) => {
    setSelectedPdfId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPdfId !== null) {
      setPdfs(pdfs.filter((pdf) => pdf.id !== selectedPdfId));
      setSelectedPdfId(null);
      setIsModalOpen(false);
    }
  };

  const handleUpload = (file: File) => {
    const newPdf = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file), // Temporary URL; replace with API logic
    };
    setPdfs([...pdfs, newPdf]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PDFList pdfs={pdfs} onDelete={handleDelete} />
        <PDFUploader onUpload={handleUpload} />
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminPage;
