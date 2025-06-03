import React, { useEffect, useState } from "react";
import * as userService from "@/services/user/userService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import RegisterForm from "@/components/Login/RegisterForm";
import { Trash2 } from "lucide-react";

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
    <section className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">Gestión de Usuarios</h1>
      {/* Botón para crear usuario */}
      {isAuthenticated && role === "superadmin" && (
        <div className="mb-6 flex justify-end">
          <button
            className="px-4 py-2 rounded-xl bg-[#51590E] text-white font-bold hover:bg-[#B695BF] transition"
            onClick={() => setShowRegister(true)}
          >
            + Crear usuario
          </button>
        </div>
      )}

      {showRegister && (
        <RegisterForm
          onSuccess={() => {
            setShowRegister(false);
            cargarUsuarios();
          }}
          onClose={() => setShowRegister(false)}
        />
      )}

      {loading ? (
        <div className="text-gray-400">Cargando usuarios...</div>
      ) : (
        <table className="min-w-full bg-[#212026] rounded-xl overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-[#51590E] text-[#212026]">
              <th className="px-4 py-2 text-left text-white">Nombre</th>
              <th className="px-4 py-2 text-left text-white">Email</th>
              <th className="px-4 py-2 text-left text-white">Rol</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                    <tr key={user.id} className="bg-white border-b border-[#51590E]/20">
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          user.role === "superadmin"
                            ? "bg-[#D94854] text-white"
                            : user.role === "admin"
                            ? "bg-[#51590E] text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {user.role !== "superadmin" && (
                        <select
                          className="rounded-lg px-2 py-1 bg-[#ffffff] text-[#212026] font-semibold"
                          value={user.role}
                          onChange={(e) =>
                            cambiarRol(
                              user.id,
                              e.target.value as "viewer" | "admin"
                            )
                          }
                        >
                          <option value="viewer">viewer</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                      {user.role === "superadmin" && (
                        <span className="text-xs italic text-gray-400">
                          No editable
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {user.role !== "superadmin" && (
                        <button
                          className="text-[#D94854] hover:text-[#F23D5E] transition p-1 rounded"
                          onClick={() => eliminarUsuario(user.id)}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
                <tr>
                <td colSpan={5} className="text-center text-gray-400 py-6">
                    No hay usuarios para mostrar.
                </td>
                </tr>
            )}
            </tbody>
        </table>
      )}
    </section>
  );
};
