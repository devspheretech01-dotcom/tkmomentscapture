import { useState } from "react";
import { useNavigate } from "react-router-dom";

const packages = [
    {
    id: 1,
    name: "Silver Package",
    price: "₹45,000",
    days: "1 Day",
    tag: "Starter",
    color: "#b8a99a",
    includes: [
        "Semi Candid Photographer",
        "Semi Candid Videographer",
        "Upcoming Teaser (Save the Date)",
        "1 Reel",
        "10 Edited Photos",
        "Raw Data",
      "Full Pre-Wedding Shoot",
    ],
},
{
    id: 2,
    name: "Gold Package",
    price: "₹55,000",
    days: "2 Days",
    tag: "Most Popular",
    color: "#c9a84c",
    includes: [
        "Semi Candid Photographer",
        "Semi Candid Videographer",
        "Upcoming Teaser (Save the Date)",
        "1 Reel",
        "10 Edited Photos",
        "Raw Data",
      "Full Pre-Wedding Shoot",
    ],
},
{
    id: 3,
    name: "Platinum Package",
    price: "₹65,000",
    days: "2 Days",
    tag: "Premium",
    color: "#7a6d8a",
    includes: [
        "Candid Photographer",
        "Cinematographer",
        "Upcoming Teaser (Save the Date)",
        "1 Reel",
        "10 Edited Photos",
        "Raw Data",
        "Drone Coverage",
        "Full Pre-Wedding Shoot",
    ],
},
];

const terms = [
    "A total of 4 to 5 team members will be present for the pre-wedding shoot.",
    "All expenses related to the shoot, including travel, accommodation, and meals for the entire team, will be borne by the client.",
    "We shall not be held responsible for any delays, interruptions, or cancellation of the shoot due to rain, adverse weather conditions, natural events, government restrictions, or any unforeseen technical issues.",
    "In such circumstances, the shoot may be rescheduled to a mutually agreed date, subject to availability.",
  "Any charges related to cars, transportation, entry fees, permits, locations, resorts, or shooting venues during the pre-wedding shoot will be borne by the client. All such expenses are not included in our package and must be paid separately by the client.",
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#e8ddd5" />
    <path d="M4.5 8.2l2.3 2.3 4.2-4.5" stroke="#8c6b55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlowerDivider = () => (
    <svg viewBox="0 0 200 24" width="160" height="20" fill="none" style={{ display: "block", margin: "0 auto" }}>
    <line x1="0" y1="12" x2="75" y2="12" stroke="#d4bfb0" strokeWidth="0.8" />
    <circle cx="100" cy="12" r="4" fill="#d4bfb0" />
    <circle cx="88" cy="12" r="2.5" fill="#e8ddd5" />
    <circle cx="112" cy="12" r="2.5" fill="#e8ddd5" />
    <line x1="125" y1="12" x2="200" y2="12" stroke="#d4bfb0" strokeWidth="0.8" />
  </svg>
);

export default function WeddingPricingGuide() {
    const [openTerms, setOpenTerms] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #fdf9f6 0%, #f5ede6 50%, #fdf9f6 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0 0 60px",
    }}>

      {/* Hero Header */}
      <div style={{
        textAlign: "center",
        padding: "64px 24px 40px",
        position: "relative",
      }}>
        <div style={{
          fontSize: "11px",
          letterSpacing: "0.35em",
          color: "#b8a99a",
          textTransform: "uppercase",
          marginBottom: "12px",
          fontFamily: "'Arial', sans-serif",
          fontWeight: 400,
        }}>
          {/* — Moments Worth Remembering — */}
        </div>
        <h1 style={{
          fontSize: "clamp(42px, 8vw, 72px)",
          fontWeight: 300,
          color: "#3d2c24",
          margin: "0 0 8px",
          letterSpacing: "0.12em",
          lineHeight: 1.1,
        }}>
          Pre-Wedding
        </h1>
        <div style={{
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          fontSize: "clamp(22px, 4vw, 36px)",
          color: "#b8875c",
          letterSpacing: "0.04em",
          marginBottom: "24px",
        }}>
          Pricing Guide
        </div>
        <FlowerDivider />
        <p style={{
          maxWidth: "480px",
          margin: "24px auto 0",
          fontSize: "14px",
          color: "#8c7a70",
          lineHeight: 1.8,
          fontFamily: "'Arial', sans-serif",
          fontWeight: 300,
          letterSpacing: "0.02em",
        }}>
          Curated photography & cinematography packages designed to capture every emotion of your special day.
        </p>
      </div>

      {/* Package Cards */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "28px",
        padding: "20px 24px 48px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        {packages.map((pkg) => {
          const isHovered = hoveredCard === pkg.id;
          const isPopular = pkg.tag === "Most Popular";
          return (
            <div
              key={pkg.id}
              onMouseEnter={() => setHoveredCard(pkg.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: isHovered
                  ? "linear-gradient(160deg, #fff8f4 0%, #fdf0e8 100%)"
                  : "#fff",
                border: isPopular
                  ? `2px solid ${pkg.color}`
                  : "1.5px solid #ecddd5",
                borderRadius: "20px",
                padding: "36px 30px 32px",
                width: "300px",
                flex: "0 0 300px",
                position: "relative",
                boxShadow: isHovered
                  ? "0 20px 60px rgba(140,107,85,0.16)"
                  : isPopular
                  ? "0 8px 32px rgba(140,107,85,0.12)"
                  : "0 2px 16px rgba(140,107,85,0.07)",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                cursor: "default",
              }}
            >
              {/* Tag Badge */}
              <div style={{
                position: "absolute",
                top: "-14px",
                left: "50%",
                transform: "translateX(-50%)",
                background: pkg.color,
                color: "#fff",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "5px 18px",
                borderRadius: "20px",
                fontFamily: "'Arial', sans-serif",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                {pkg.tag}
              </div>

              {/* Days Badge */}
              <div style={{
                display: "inline-block",
                background: "#fdf0e8",
                border: `1px solid ${pkg.color}44`,
                borderRadius: "30px",
                padding: "4px 16px",
                fontSize: "11px",
                color: pkg.color,
                fontFamily: "'Arial', sans-serif",
                letterSpacing: "0.08em",
                marginBottom: "16px",
                fontWeight: 500,
              }}>
                {pkg.days}
              </div>

              {/* Package Name */}
              <h2 style={{
                fontSize: "22px",
                fontWeight: 400,
                color: "#3d2c24",
                margin: "0 0 6px",
                letterSpacing: "0.08em",
              }}>
                {pkg.name}
              </h2>

              {/* Price */}
              <div style={{
                fontSize: "36px",
                fontWeight: 300,
                color: pkg.color,
                marginBottom: "6px",
                letterSpacing: "-0.01em",
              }}>
                {pkg.price}
              </div>
              <div style={{
                fontSize: "11px",
                color: "#b8a99a",
                fontFamily: "'Arial', sans-serif",
                marginBottom: "24px",
                letterSpacing: "0.05em",
              }}>
                All-inclusive package
              </div>

              {/* Divider */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #ecddd5, transparent)",
                marginBottom: "24px",
              }} />

              {/* Inclusions */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {pkg.includes.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "12px",
                    fontSize: "13px",
                    color: "#5c4a3e",
                    lineHeight: 1.5,
                    fontFamily: "'Arial', sans-serif",
                  }}>
                    <span style={{ marginTop: "2px", flexShrink: 0 }}><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button onClick={()=> navigate("/contact")} style={{
                marginTop: "24px",
                width: "100%",
                padding: "13px",
                background: isHovered ? pkg.color : "transparent",
                border: `1.5px solid ${pkg.color}`,
                borderRadius: "40px",
                color: isHovered ? "#fff" : pkg.color,
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "'Arial', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}>
                Contact Us 
              </button>
            </div>
          );
        })}
      </div>

      {/* Terms & Conditions Accordion */}
      <div style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "0 24px",
      }}>
        <div style={{
          background: "#fff",
          border: "1.5px solid #ecddd5",
          borderRadius: "16px",
          overflow: "hidden",
        }}>
          <button
            onClick={() => setOpenTerms(!openTerms)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              padding: "22px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{
                fontSize: "10px",
                letterSpacing: "0.3em",
                color: "#b8a99a",
                textTransform: "uppercase",
                fontFamily: "'Arial', sans-serif",
                marginBottom: "4px",
              }}>
                Please Read
              </div>
              <div style={{
                fontSize: "18px",
                color: "#3d2c24",
                fontWeight: 400,
                letterSpacing: "0.05em",
              }}>
                Pre-Wedding Terms & Conditions
              </div>
            </div>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid #ecddd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "transform 0.3s",
              transform: openTerms ? "rotate(45deg)" : "rotate(0deg)",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="7" y1="1" x2="7" y2="13" stroke="#b8a99a" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="7" x2="13" y2="7" stroke="#b8a99a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </button>

          <div style={{
            maxHeight: openTerms ? "600px" : "0",
            overflow: "hidden",
            transition: "max-height 0.4s ease",
          }}>
            <div style={{
              padding: "0 28px 28px",
              borderTop: "1px solid #f0e6df",
            }}>
              <div style={{ height: "20px" }} />
              {terms.map((term, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "16px",
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    minWidth: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#f5ede6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    color: "#b8875c",
                    fontFamily: "'Arial', sans-serif",
                    fontWeight: 600,
                    flexShrink: 0,
                    marginTop: "1px",
                  }}>
                    {i + 1}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b5a52",
                    lineHeight: 1.7,
                    fontFamily: "'Arial', sans-serif",
                  }}>
                    {term}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: "center",
          marginTop: "40px",
          padding: "24px",
          background: "linear-gradient(135deg, #fdf9f6, #f5ede6)",
          borderRadius: "16px",
          border: "1px solid #ecddd5",
        }}>
          <div style={{
            fontSize: "13px",
            color: "#8c7a70",
            fontFamily: "'Arial', sans-serif",
            lineHeight: 1.8,
          }}>
            📸 &nbsp;For bookings & enquiries, feel free to reach out.<br />
            <span style={{ color: "#b8875c", fontStyle: "italic" }}>
              "Every love story is beautiful, let us capture yours."
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}