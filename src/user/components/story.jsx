import { useState } from "react";

const films = [
  { id: 1, names: "Dhruv & Pippa", bg: "linear-gradient(135deg,#e8c97a,#c9954a)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.05_PM_1_oq9zbj.jpg", textStyle: "italic" },
  { id: 2, names: "Palak & Priya", bg: "linear-gradient(135deg,#f4b8d0,#e07fa0)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480770/WhatsApp_Image_2026-06-01_at_7.21.05_PM_cstom2.jpg", textStyle: "italic" },
  { id: 3, names: "Indu & Sahil", bg: "linear-gradient(135deg,#b8d4c8,#6aaa8e)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480767/WhatsApp_Image_2026-06-01_at_7.21.03_PM_1_ot69ar.jpg", textStyle: "italic" },
  { id: 4, names: "AVI\nVAI", bg: "linear-gradient(135deg,#f0f0ec,#d8d4c8)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.02_PM_1_egzcau.jpg", textStyle: "logo" },
  { id: 5, names: "Divya & Rohan", bg: "linear-gradient(135deg,#f7d6c4,#e89060)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.06_PM_1_jphxva.jpg", textStyle: "italic" },
];

export default function WeddingCarousel() {
  const [current, setCurrent] = useState(0);
  const visible = 4;

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : films.length - visible));
  const next = () => setCurrent((c) => (c < films.length - visible ? c + 1 : 0));

  const visibleFilms = films.slice(current, current + visible);

  return (
    <div id="wedding-films" className="wedding-carousel" style={{ background: "#ccc2b7b4", padding: "48px 40px 40px", position: "relative" }}>
      <div className="wedding-carousel-header" style={{ marginBottom: 40, textAlign: "center" }}>
        <h1
          className="wedding-carousel-title"
          style={{
            fontSize: 48,
            fontFamily: "'Parisienne', cursive",
            fontWeight: 700,
            color: "#e25f1d",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            marginBottom: 0,
            letterSpacing: 1,
            background: "linear-gradient(135deg, rgb(61, 37, 26) 0%, rgb(255 123 70) 100%) text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Beautiful Weddings, Breathtaking Films
        </h1>
      </div>

      <button onClick={prev} className="wedding-carousel-nav wedding-carousel-nav-left" style={navBtn("left")} aria-label="Previous wedding film">
        {"<"}
      </button>
      <button onClick={next} className="wedding-carousel-nav wedding-carousel-nav-right" style={navBtn("right")} aria-label="Next wedding film">
        {">"}
      </button>

      <div className="wedding-carousel-track" style={{ display: "flex", gap: 16 }}>
        {visibleFilms.map((film) => (
          <div key={film.id} className="wedding-carousel-card" style={cardStyle(film.bg)}>
            <img src={film.image} alt={film.names} style={cardImageStyle} />
            <div style={overlayStyle}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)" }}>TK moments</span>
              <span style={film.textStyle === "logo" ? logoNameStyle : italicNameStyle}>
                {film.names}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="wedding-carousel-actions" style={{ display: "flex", gap: 16, marginTop: 20 }}>
        {visibleFilms.map((film) => (
          <div key={film.id} className="wedding-carousel-action" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button style={watchBtnStyle}>Watch Film</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const navBtn = (side) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  [side]: 8,
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "rgba(40,40,40,0.7)",
  color: "#fff",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  zIndex: 10,
});

const cardStyle = (bg) => ({
  flex: "0 0 calc(25% - 12px)",
  borderRadius: 12,
  overflow: "hidden",
  position: "relative",
  aspectRatio: "3/4",
  cursor: "pointer",
  background: bg,
});

const overlayStyle = {
  position: "absolute",
  inset: 0,
  padding: 16,
  background: "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent 30%, rgba(0,0,0,0.3))",
  display: "flex",
  flexDirection: "column",
};

const italicNameStyle = {
  marginTop: "auto",
  fontSize: 26,
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  color: "#fff",
  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
};

const logoNameStyle = {
  marginTop: "auto",
  fontSize: 42,
  fontFamily: "sans-serif",
  fontWeight: 700,
  letterSpacing: -2,
  color: "#1a2e1a",
  whiteSpace: "pre",
};

const watchBtnStyle = {
  background: "rgba(40,40,40,0.85)",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 28px",
  fontSize: 14,
  cursor: "pointer",
};

const cardImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
