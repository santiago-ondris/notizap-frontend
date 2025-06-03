import React, { useState } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "@/services/authService";
import { X } from "lucide-react";

interface ForgotPasswordFormProps {
  onClose: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("Si existe una cuenta, recibirás instrucciones por email.");
      onClose();
    } catch {
      toast.error("Error al solicitar recuperación. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <form onSubmit={handleSubmit} className="relative bg-[#212026] p-8 rounded-2xl shadow-2xl flex flex-col gap-6 min-w-[320px] max-w-xs border border-[#B695BF]/20">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-[#B695BF] hover:text-[#D94854] transition" aria-label="Cerrar">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center text-[#D94854]">Recuperar contraseña</h2>
        <input
          type="email"
          placeholder="Email"
          className="rounded p-3 bg-white/10 text-white border-none focus:ring-2 focus:ring-[#D94854] placeholder:text-[#B695BF]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="w-full py-3 rounded-xl bg-[#D94854] text-white font-bold text-lg hover:bg-[#F23D5E] transition" disabled={loading}>
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
