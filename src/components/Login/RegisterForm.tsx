import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface RegisterFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onClose }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ username, email, password });
      toast.success("Usuario registrado. ¡Ya puedes iniciar sesión!");
      onSuccess();
    } catch {
      toast.error("Error al registrar usuario. ¿El email ya existe?");
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
        <h2 className="text-2xl font-bold text-center text-[#D94854]">Registrarse</h2>
        <input
          type="text"
          placeholder="Nombre y apellido"
          className="rounded p-3 bg-white/10 text-white border-none focus:ring-2 focus:ring-[#D94854] placeholder:text-[#B695BF]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="rounded p-3 bg-white/10 text-white border-none focus:ring-2 focus:ring-[#D94854] placeholder:text-[#B695BF]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="rounded p-3 bg-white/10 text-white border-none focus:ring-2 focus:ring-[#D94854] placeholder:text-[#B695BF]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full py-3 rounded-xl bg-[#D94854] text-white font-bold text-lg hover:bg-[#F23D5E] transition" disabled={loading}>
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
