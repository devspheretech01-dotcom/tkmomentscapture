import { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import UserLayout from "@user/layouts/UserLayout";
import Header from "@user/components/Header";
import Hero from "@user/components/Hero";
import TKMoments from "@user/components/AboutSection";
import WeddingCarousel from "@user/components/story";
import WeddingStories from "@user/components/WeddingStories";
import WeddingFilms from "@user/components/WeddingFilms";
import Prewedding from "@user/components/Prewedding";
import AboutPage from "@user/components/AboutPage";
import { PackageBuilder } from "@user/components/package-builder";
import Packageposter from "@user/components/packageposter";
import Instagram from "@user/components/instagram";
import ContactUs from "@user/components/contact";
import MinimalFooter from "@user/components/fotter";

const pageRoutes = {
  "wedding-stories": "/wedding-stories",
  "wedding-films": "/wedding-films",
  prewedding: "/prewedding",
  about: "/about",
  contact: "/contact",
};

function HomePage({ onBuildPackage }) {
  return (
    <>
      <Hero onBuildPackage={onBuildPackage} />
      <TKMoments />
      <WeddingCarousel />
      <Packageposter onBuildPackage={onBuildPackage} />
      <Instagram />
    </>
  );
}

export default function UserRoutes() {
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isStandalonePage =
    location.pathname === "/wedding-stories" ||
    location.pathname === "/wedding-films" ||
    location.pathname === "/prewedding" ||
    location.pathname === "/about" ||
    location.pathname === "/contact";

  const handleNavigate = (target) => {
    setShowPackageBuilder(false);

    if (pageRoutes[target]) {
      navigate(pageRoutes[target]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/");

    if (target === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.setTimeout(
      () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }),
      0
    );
  };

  return (
    <UserLayout>
      {showPackageBuilder ? (
        <PackageBuilder onBack={() => setShowPackageBuilder(false)} />
      ) : (
        <>
          <Header
            alwaysDark={isStandalonePage}
            onNavigate={handleNavigate}
          />
          <Routes>
            <Route path="/" element={<HomePage onBuildPackage={() => setShowPackageBuilder(true)} />} />
            <Route path="/wedding-stories" element={<WeddingStories />} />
            <Route path="/wedding-films" element={<WeddingFilms />} />
            <Route path="/prewedding" element={<Prewedding />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<HomePage onBuildPackage={() => setShowPackageBuilder(true)} />} />
          </Routes>
          <MinimalFooter onNavigate={handleNavigate} />
        </>
      )}
    </UserLayout>
  );
}
