"use client";

import React, { useEffect, useState } from "react";
import PDFList from "../components/PDFList";
import PDFUploader from "../components/PDFUploader";
import { apiPdfs } from "../utils/api";
import ConfirmationModal from "../components/ConfirmationModal";

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
  const [selectedPdfId, setSelectedPdfId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPDFs = async () => {
    const response = await apiPdfs.get("/pdfs");
    setPdfs(response.data);
  };

  const handleDelete = async () => {
    if (selectedPdfId !== null) {
      await apiPdfs.delete(`/pdfs/${selectedPdfId}`);
      setPdfs(pdfs.filter((pdf) => pdf.id !== selectedPdfId));
      setIsModalOpen(false);
    }
  };

  const handleUpload = async (description: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("file1", file); // Attach the file
  
      const response = await apiPdfs.post("/pdfs", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Specify form-data content type
        },
      });
  
      // Add the new PDF to the list
      setPdfs([...pdfs, response.data]);
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload the file. Please try again.");
    }
  };
  

  useEffect(() => {
    fetchPDFs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PDFList
          pdfs={pdfs}
          onDelete={(id) => {
            setSelectedPdfId(id);
            setIsModalOpen(true);
          }}
        />
        <PDFUploader onUpload={handleUpload} />
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminPage;
