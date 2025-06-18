import React, { useEffect, useState } from "react";
import * as userService from "@/services/user/userService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import RegisterForm from "@/components/Login/RegisterForm";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { UsersTable } from "@/components/Login/UsersTable";

interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const UsersPage: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role === "superadmin") {
      cargarUsuarios();
    }
  }, [isAuthenticated, role]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const cambiarRol = async (id: number, nuevoRol: "viewer" | "admin") => {
    if (!window.confirm("¿Estás seguro de cambiar el rol?")) return;
    try {
      await userService.updateUserRole(id, nuevoRol);
      toast.success("Rol actualizado correctamente");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: nuevoRol } : u))
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al actualizar rol";
      toast.error(msg);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await userService.deleteUser(id);
      toast.success("Usuario eliminado");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Error al eliminar usuario";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-xl">
              <Users className="w-6 h-6 text-[#B695BF]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">👥 Gestión de Usuarios</h1>
              <p className="text-white/60 text-sm">
                Administra los usuarios y sus permisos en el sistema
              </p>
            </div>
          </div>

          {isAuthenticated && role === "superadmin" && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] rounded-xl transition-all duration-200 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Crear Usuario
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#51590E]">
            {users.length}
          </div>
          <div className="text-xs text-white/60">Total Usuarios</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#B695BF]">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-xs text-white/60">Administradores</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[#D94854]">
            {users.filter(u => u.role === 'superadmin').length}
          </div>
          <div className="text-xs text-white/60">Super Admins</div>
        </div>
      </div>

      {/* Modal de registro */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#212026] border border-white/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <RegisterForm
              onSuccess={() => {
                setShowRegister(false);
                cargarUsuarios();
              }}
              onClose={() => setShowRegister(false)}
            />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mb-3" />
            <p className="text-white/60 text-sm">Cargando usuarios...</p>
          </div>
        ) : (
          <UsersTable
            users={users}
            onRoleChange={cambiarRol}
            onDeleteUser={eliminarUsuario}
          />
        )}
      </div>
      </div>
    </div>
  );
};