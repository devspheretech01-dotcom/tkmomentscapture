const films = [
  { id: 1, names: "Dhruv & Pippa", bg: "linear-gradient(135deg,#e8c97a,#c9954a)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.05_PM_1_oq9zbj.jpg", textStyle: "italic" },
  { id: 2, names: "Palak & Priya", bg: "linear-gradient(135deg,#f4b8d0,#e07fa0)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480770/WhatsApp_Image_2026-06-01_at_7.21.05_PM_cstom2.jpg", textStyle: "italic" },
  { id: 3, names: "Indu & Sahil", bg: "linear-gradient(135deg,#b8d4c8,#6aaa8e)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480767/WhatsApp_Image_2026-06-01_at_7.21.03_PM_1_ot69ar.jpg", textStyle: "italic" },
  { id: 4, names: "AVI & VAI", bg: "linear-gradient(135deg,#f0f0ec,#d8d4c8)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.02_PM_1_egzcau.jpg", textStyle: "italic" },
  { id: 5, names: "Divya & Rohan", bg: "linear-gradient(135deg,#f7d6c4,#e89060)", image: "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.06_PM_1_jphxva.jpg", textStyle: "italic" },
];

export default function WeddingCarousel() {
  const marqueeFilms = [...films, ...films];

  return (
    <div id="wedding-films" className="wedding-carousel" style={{ background: "#F9E2CA", padding: "88px 40px 40px", position: "relative", overflow: "hidden" }}>
      <style>
        {`
          @keyframes weddingMarqueeLeftToRight {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }

          .wedding-carousel-marquee {
            overflow: hidden;
            width: 100%;
            padding: 4px 0;
          }

          .wedding-carousel-track {
            animation: weddingMarqueeLeftToRight 28s linear infinite;
            will-change: transform;
          }

          .wedding-carousel-marquee:hover .wedding-carousel-track {
            animation-play-state: paused;
          }

          @media (max-width: 640px) {
            .wedding-carousel {
              padding: 78px 16px 32px !important;
            }

            .wedding-carousel-wave {
              height: 30px !important;
            }

            .wedding-carousel-title {
              font-size: 34px !important;
              line-height: 1.08;
            }
          }
        `}
      </style>
      <div className="wedding-carousel-wave" style={waveStyle} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={waveSvgStyle}>
          <path
            d="M0,36 C180,62 330,62 480,38 C650,10 790,10 960,38 C1110,62 1260,62 1440,36 L1440,0 L0,0 Z"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="wedding-carousel-header" style={{ marginBottom: 40, textAlign: "center", position: "relative", zIndex: 1 }}>
        <h1
          className="wedding-carousel-title"
          style={{
            fontSize: 48,
            fontFamily: "'Cormorant Infant', Georgia, serif",
            fontWeight: 400,
            color: "#e25f1d",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0)",
            marginBottom: 0,
            letterSpacing: 1,
            background: "linear-gradient(135deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%) text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Beautiful Weddings, Breathtaking Films
        </h1>
      </div>

      <div className="wedding-carousel-marquee" style={{ position: "relative", zIndex: 1 }}>
        <div className="wedding-carousel-track" style={{ display: "flex", gap: 16, width: "max-content" }}>
          {marqueeFilms.map((film, index) => (
            <div key={`${film.id}-${index}`} className="wedding-carousel-item" style={marqueeItemStyle}>
              <div className="wedding-carousel-card" style={cardStyle(film.bg)}>
                <img src={film.image} alt={film.names} style={cardImageStyle} />
                <div style={overlayStyle}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)" }}>TK moments</span>
                  <span style={film.textStyle === "logo" ? logoNameStyle : italicNameStyle}>
                    {film.names}
                  </span>
                </div>
              </div>
              <button style={watchBtnStyle}>Watch Film</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = (bg) => ({
  width: "clamp(220px, 23vw, 320px)",
  borderRadius: 12,
  overflow: "hidden",
  position: "relative",
  aspectRatio: "3/4",
  cursor: "pointer",
  background: bg,
});

const marqueeItemStyle = {
  flex: "0 0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
};

const waveStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: 64,
  pointerEvents: "none",
};

const waveSvgStyle = {
  width: "100%",
  height: "100%",
  display: "block",
};

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
