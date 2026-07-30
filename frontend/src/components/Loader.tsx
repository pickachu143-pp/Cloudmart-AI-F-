import React from "react";

const Loader: React.FC<{ label?: string; fullScreen?: boolean }> = ({ label = "Loading...", fullScreen }) => {
  return (
    <div
      className={
        fullScreen
          ? "min-h-[60vh] flex flex-col items-center justify-center gap-3"
          : "flex flex-col items-center justify-center gap-3 py-10"
      }
    >
      <div className="h-9 w-9 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
};

export default Loader;
