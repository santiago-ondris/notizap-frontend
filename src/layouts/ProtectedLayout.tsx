import React from "react";
import { Outlet } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { RequireAuth } from "@/routes/RequireAuth";

export const ProtectedLayout: React.FC = () => (
  <AppLayout>
    <RequireAuth allowedRoles={["admin", "superadmin", "hr"]}>
      <Outlet />
    </RequireAuth>
  </AppLayout>
);