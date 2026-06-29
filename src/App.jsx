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


// export default function App() {
//   return (
//     <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
//       <div className="max-w-2xl text-center">
//         {/* Logo */}
//         <div className="mb-8">
//           <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-gray-700 bg-gray-900">
//             <span className="text-3xl font-bold">⚙</span>
//           </div>
//         </div>

//         {/* Heading */}
//         <h1 className="text-5xl md:text-6xl font-bold tracking-wide">
//           Under Maintenance
//         </h1>

//         {/* Divider */}
//         <div className="mx-auto mt-6 h-px w-32 bg-gray-700"></div>

//         {/* Description */}
//         <p className="mt-8 text-lg text-gray-400 leading-8">
//           We're currently performing scheduled maintenance to improve your
//           experience.
//           <br />
//           Our website will be back online shortly.
//         </p>

//         {/* Status */}
//         <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2">
//           <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
//           <span className="text-yellow-300 font-medium">
//             Maintenance in Progress
//           </span>
//         </div>

//         {/* Footer */}
//         <div className="mt-16 border-t border-gray-800 pt-6">
//           <p className="text-sm text-gray-500">
//             © {new Date().getFullYear()} TK Moments Capture. All Rights Reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
