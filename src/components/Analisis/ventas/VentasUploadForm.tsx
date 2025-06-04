import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onUpload: (file: File) => void;
  loading: boolean;
}

export const VentasUploadForm: React.FC<Props> = ({ onUpload, loading }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-2xl shadow-xl bg-white max-w-lg mx-auto">
      <label className="text-lg font-semibold">Subí el archivo de ventas (.xlsx)</label>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        disabled={loading}
        className="mb-2"
        onChange={handleChange}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={loading}>
        Seleccionar archivo
      </Button>
    </div>
  );
};
