import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoutes }    from "./PublicRoutes";
import { ProtectedLayout } from "../layouts/ProtectedLayout";
import { ProtectedRoutes } from "./ProtectedRoutes";
import NotFoundPage        from "@/pages/NotFoundPage";
import { PublicLayout } from "../layouts/PublicLayout";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      {PublicRoutes}
    </Route>

    <Route path="/*" element={<ProtectedLayout />}>
      {ProtectedRoutes}
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;