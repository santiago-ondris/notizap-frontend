import api from "@/api/api";

export async function getAllUsers() {
  const res = await api.get("/api/v1/users");
  return res.data;
}

export async function updateUserRole(id: number, role: string) {
  const res = await api.put(`/api/v1/users/${id}/role`, { role });
  return res.data;
}

export async function deleteUser(id: number) {
  return api.delete(`/api/v1/users/${id}`);
}