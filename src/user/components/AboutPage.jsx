import { Link } from "react-router-dom";
import { Camera, Clapperboard, FileText, Heart, MapPin } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Emotion First",
    text: "We look for the nervous smiles, quiet glances, loud hugs, and all the small in-between moments that make your day feel like yours.",
  },
  {
    icon: Camera,
    title: "Cinematic Craft",
    text: "Our frames are composed with intention, using natural light, movement, and honest direction to create timeless wedding photographs.",
  },
  {
    icon: Clapperboard,
    title: "Films With Soul",
    text: "Every film is edited like a memory: warm, personal, and paced around the people and rituals that mattered most.",
  },
];

const timeline = [
  "Pre-wedding stories and couple shoots",
  "Wedding photography and cinematic films",
  "Candid rituals, portraits, family moments",
  "Albums, reels, teasers, and final delivery",
];

const testimonials = [
  {
    quote:
      "TK Moments captured our wedding exactly how it felt. The photos are elegant, emotional, and full of little moments we had completely missed on the day.",
    name: "Riddhi & Dharam",
    detail: "Pre-wedding and wedding film",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=300",
  },
  {
    quote:
      "The team made us feel comfortable from the first meeting. Nothing felt forced, and the final film still makes our family emotional every time.",
    name: "Anusha & Varun",
    detail: "Wedding photography",
    location: "Bharuch",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=300",
  },
  {
    quote:
      "They were calm, punctual, and beautifully observant. Every ritual, portrait, and family memory was handled with real care.",
    name: "Maitri & Aneesh",
    detail: "Destination wedding",
    location: "Goa",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300",
  },
];

const highlights = [
  { value: "800+", label: "Wedding stories" },
  { value: "10+", label: "Years of craft" },
  { value: "98%", label: "Happy couples" },
];

const termsConditions = [
  "If any electronic item gets defective, TK Moments Capture will not be responsible for damage such as camera, memory card, hard disk, or similar storage/media issues.",
  "For order confirmation, an advance payment of 10K is required. If you cancel the order, the advance payment will not be refundable.",
  "70% payment must be made as soon as the wedding is over. The receipt will be provided, and the remaining payment must be submitted after handover of your data.",
  "You must visit the office for photo selection after the marriage. The earlier you come, the earlier your data can be prepared and delivered.",
  "Changes in album and photos can be requested only one time. Additional change requests will be chargeable.",
  "The couple must give proper time to the photographer for portrait photography.",
  "Transportation is included between Ankleshwar and Bharuch up to 40 km. If the location is more than 40 km from Ankleshwar-Bharuch, transportation charges will apply.",
  "Disrespect, abuse, or misbehavior toward any TK Moments Capture team member will not be tolerated.",
];

export default function AboutPage() {
  return (
    <main id="about" className="about-page">
      <div className="about-page-bg-word" aria-hidden="true">Moments</div>
      <section className="about-page-hero">
        <div className="about-page-copy">
          <span className="about-page-kicker">About TK Moments capture</span>
          <h1>We turn wedding days into stories you can return to forever.</h1>
          <p>
            TK Moments is a wedding photography and filmmaking studio based in Bharuch,
            creating heartfelt visual stories for couples and families across celebrations,
            destinations, rituals, and once-in-a-lifetime gatherings.
          </p>
          <p>
            Our work is calm, attentive, and deeply human. We blend documentary instinct
            with editorial polish so your photographs feel honest today and beautiful years
            from now.
          </p>
          <Link className="btn btn-solid" to="/contact">
            Start a Conversation
          </Link>

          <div className="about-page-highlights" aria-label="TK Moments highlights">
            {highlights.map((highlight) => (
              <div key={highlight.label}>
                <strong>{highlight.value}</strong>
                <span>{highlight.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-page-image-stack" aria-label="TK Moments wedding work">
          <img
            className="about-page-image about-page-image-large"
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=85&w=1200"
            alt="Bride and groom during a wedding ceremony"
          />
          <img
            className="about-page-image about-page-image-small"
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=85&w=900"
            alt="Wedding couple holding hands"
          />
          <div className="about-page-location">
            <MapPin size={16} strokeWidth={1.7} />
            Bharuch and beyond
          </div>
          <div className="about-page-frame-note">
            <span>01</span>
            Documentary warmth, editorial finish.
          </div>
        </div>
      </section>

      <section className="about-page-values" aria-label="Our approach">
        {values.map(({ icon: Icon, title, text }) => (
          <article className="about-value" key={title}>
            <Icon size={24} strokeWidth={1.4} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="about-page-story">
        <div>
          <span className="about-page-kicker">Our Promise</span>
          <h2>Present on the day. Precise in the edit.</h2>
        </div>
        <div className="about-page-story-copy">
          <p>
            We plan carefully before the wedding, stay unobtrusive during the rituals,
            and shape the final story with patience. From the first consultation to the
            final album, our process is built around trust, clarity, and care.
          </p>
          <ul>
            {timeline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-page-terms" aria-labelledby="about-terms-title">
        <div className="about-terms-heading">
          <span className="about-page-kicker">Terms & Conditions</span>
          <h2 id="about-terms-title">Clear commitments before every booking.</h2>
          <p>
            Please read these booking terms carefully so expectations, payments,
            delivery, and conduct stay clear from the beginning.
          </p>
        </div>

        <div className="about-terms-list">
          {termsConditions.map((term, index) => (
            <article className="about-term" key={term}>
              <span className="about-term-number">{String(index + 1).padStart(2, "0")}</span>
              <FileText size={20} strokeWidth={1.5} aria-hidden="true" />
              <p>{term}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-page-testimonials" aria-labelledby="about-testimonials-title">
        <div className="about-testimonials-heading">
          <span className="about-page-kicker">Testimonials</span>
          <h2 id="about-testimonials-title">Words from couples who trusted us.</h2>
        </div>

        <div className="about-testimonials-grid">
          {testimonials.map((testimonial) => (
            <article className="about-testimonial" key={testimonial.name}>
              <span className="about-testimonial-mark" aria-hidden="true">"</span>
              <div className="about-testimonial-rating" aria-label="5 star review">
                <span aria-hidden="true">★★★★★</span>
              </div>
              <p>"{testimonial.quote}"</p>
              <div className="about-testimonial-person">
                <img src={testimonial.image} alt={testimonial.name} loading="lazy" />
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.detail}</span>
                  <small>{testimonial.location}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
