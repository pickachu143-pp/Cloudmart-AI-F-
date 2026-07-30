import React from "react";
import { Link } from "react-router-dom";
import { CloudOff } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <CloudOff size={44} className="text-slate-300 mb-4" />
      <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
      <p className="text-slate-500 mt-2 mb-6">This page drifted off into the cloud.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
};

export default NotFound;
