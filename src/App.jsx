import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import UserRoutes from "@user/routes/UserRoutes";

const AdminRoutes = lazy(() => import("@admin/routes/AdminRoutes"));
const TK_LOGO_URL =
  "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780483492/TkLogo_ifbqv4.jpg";

function SiteLoader({ leaving = false }) {
  return (
    <div className={`site-loader${leaving ? " site-loader--leaving" : ""}`}>
      <div className="site-loader__mark" aria-hidden="true">
        <img src={TK_LOGO_URL} alt="" />
      </div>
      <div className="site-loader__ring" aria-hidden="true" />
      <div className="site-loader__circle site-loader__circle--inner" aria-hidden="true" />
      <div className="site-loader__circle site-loader__circle--outer" aria-hidden="true" />
      <span className="sr-only">Loading TK Photography</span>
    </div>
  );
}

export default function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setLoaderLeaving(true);
    }, 3000);
    const removeTimer = window.setTimeout(() => {
      setShowLoader(false);
    }, 3500);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showLoader && <SiteLoader leaving={loaderLeaving} />}
      <Suspense fallback={<SiteLoader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </Suspense>
    </>
  );
}
