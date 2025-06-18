import { Route } from "react-router-dom";
import LandingPage from "@/pages/Landing/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";

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