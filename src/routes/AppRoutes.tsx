import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { ProtectedLayout } from "../layouts/ProtectedLayout";
import { ProtectedRoutes } from "./ProtectedRoutes";
import NotFoundPage from "@/pages/NotFoundPage";
import { PublicLayout } from "../layouts/PublicLayout";
import PageLoader from "@/components/ui/PageLoader";

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<PublicLayout />}>
        {PublicRoutes}
      </Route>

      <Route path="/*" element={<ProtectedLayout />}>
        {ProtectedRoutes}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;