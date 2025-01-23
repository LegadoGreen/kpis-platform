"use client";

import React from "react";

interface LogoMessageProps {
  message: string;
}

const LogoMessage: React.FC<LogoMessageProps> = ({ message }) => {
  return (
    <div className="w-full h-full max-w-sm mx-auto bg-white p-6 rounded shadow-md flex flex-col items-center">
      {/* Logo */}
      <img src="/logo_legado.png" alt="Logo" className="w-24 mb-4" />

      {/* Loading Spinner */}
      <div className="flex justify-center items-center mb-4">
        <div className="w-8 h-8 border-4 border-legadoBrown border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Message */}
      <p className="text-center text-gray-700">{message}</p>
    </div>
  );
};

export default LogoMessage;
