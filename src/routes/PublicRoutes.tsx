import { lazy } from "react";
import { Route } from "react-router-dom";

const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export const PublicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    {/* 404 simple */}
    <Route
      path="*"
      element={<NotFoundPage />}
    />
  </>
);