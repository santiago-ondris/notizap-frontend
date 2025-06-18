import React from "react";
import { Outlet } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

export const PublicLayout: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);