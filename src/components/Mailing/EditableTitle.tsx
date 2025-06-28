import React, { useState, useRef, useEffect } from "react";
import { Edit3, Check, X, Loader2 } from "lucide-react";
import { useUpdateCampaignTitle } from "@/hooks/mailing/useMailing";
import { toast } from "react-toastify";

interface EditableTitleProps {
  campaignId: number;
  currentTitle: string;
  cuenta: "Montella" | "Alenka";
  canEdit: boolean; // Para verificar permisos
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  campaignId,
  currentTitle,
  cuenta,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateCampaignTitle();

  // Focus input cuando entra en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!canEdit) return;
    setEditValue(currentTitle);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(currentTitle);
    setIsEditing(false);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      toast.error("El título no puede estar vacío");
      return;
    }

    if (trimmedValue === currentTitle) {
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(
      { campaignId, title: trimmedValue, cuenta },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Título actualizado exitosamente");
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : "Error al actualizar título";
          toast.error(errorMessage);
          // Mantener en modo edición para que el usuario pueda corregir
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div 
        className={`group flex items-center gap-2 ${canEdit ? 'cursor-pointer' : ''}`}
        onClick={handleStartEdit}
      >
        <span className="font-medium text-white">
          {currentTitle}
        </span>
        {canEdit && (
          <Edit3 className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={updateMutation.isPending}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-[#D94854] transition-all min-w-[200px]"
        placeholder="Título de la campaña..."
        maxLength={200}
      />
      
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !editValue.trim()}
          className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Guardar (Enter)"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={updateMutation.isPending}
          className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
          title="Cancelar (Escape)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};