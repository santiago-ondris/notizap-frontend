import React from "react";
import { Trash2, Shield, Eye, Users, UserCheck, User } from "lucide-react";

interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UsersTableProps {
  users: UserDto[];
  onRoleChange: (id: number, newRole: "viewer" | "admin" | "hr") => void;
  onDeleteUser: (id: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onRoleChange,
  onDeleteUser,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Shield className="w-4 h-4" />;
      case "admin":
        return <UserCheck className="w-4 h-4" />;
      case "hr":
        return <Users className="w-4 h-4" />; // Nuevo icono para HR
      case "viewer":
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-[#D94854]/20 text-[#D94854] border-[#D94854]/30";
      case "admin":
        return "bg-[#B695BF]/20 text-[#B695BF] border-[#B695BF]/30";
      case "hr":
        return "bg-[#51590E]/20 text-[#51590E] border-[#51590E]/30"; // Nuevo color para HR
      case "viewer":
        return "bg-[#F23D5E]/20 text-[#F23D5E] border-[#F23D5E]/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="w-12 h-12 text-white/20 mb-4" />
        <p className="text-white/60 text-sm">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-1 bg-[#B695BF] rounded-full"></div>
        <h3 className="text-lg font-semibold text-white">Lista de Usuarios</h3>
      </div>

      {/* Vista desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
                Usuario
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
                Rol Actual
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/80">
                Cambiar Rol
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{user.username}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white/70">{user.email}</span>
                </td>
                <td className="py-4 px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {user.role !== "superadmin" ? (
                    <select
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:bg-white/15 focus:border-[#B695BF]/50 transition-all"
                      value={user.role}
                      onChange={(e) =>
                        onRoleChange(user.id, e.target.value as "viewer" | "admin" | "hr")
                      }
                    >
                      <option value="viewer" className="bg-[#212026] text-white">
                        viewer
                      </option>
                      <option value="admin" className="bg-[#212026] text-white">
                        admin
                      </option>
                      <option value="hr" className="bg-[#212026] text-white">
                        hr
                      </option>
                    </select>
                  ) : (
                    <span className="text-xs text-white/50 italic">
                      No editable
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end">
                    {user.role !== "superadmin" && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-2 text-[#D94854] hover:text-[#F23D5E] hover:bg-[#D94854]/10 rounded-lg transition-all"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista móvil */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{user.username}</div>
                  <div className="text-white/60 text-sm">{user.email}</div>
                </div>
              </div>
              {user.role !== "superadmin" && (
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="p-2 text-[#D94854] hover:text-[#F23D5E] hover:bg-[#D94854]/10 rounded-lg transition-all"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                {user.role}
              </div>

              {user.role !== "superadmin" ? (
                <select
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:bg-white/15 focus:border-[#B695BF]/50 transition-all"
                  value={user.role}
                  onChange={(e) =>
                    onRoleChange(user.id, e.target.value as "viewer" | "admin" | "hr")
                  }
                >
                  <option value="viewer" className="bg-[#212026] text-white">
                    viewer
                  </option>
                  <option value="admin" className="bg-[#212026] text-white">
                    admin
                  </option>
                  <option value="hr" className="bg-[#212026] text-white">
                    hr
                  </option>
                </select>
              ) : (
                <span className="text-xs text-white/50 italic">
                  No editable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};