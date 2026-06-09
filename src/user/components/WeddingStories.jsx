import { ChevronLeft, ChevronRight } from "lucide-react";

const popularStories = [
  {
    title: "Riddhi & Karan's Wedding in Mumbai, Mini Turf & One8 Commune Celebration",
    excerpt:
      "Some weddings aren't about scale they're about feeling. Riddhi & Karan's celebration was intimate, emotional, and effortlessly stylish, unfolding like a story you didn't want to end.",
    image:
      "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Anusha and Varun's wedding at InterContinental Mumbai",
    excerpt:
      "Their story began when they were just sixteen. What started as long text messages and awkward phone calls slowly turned into a real friendship, shared dreams, and a bond that only grew stronger with time.",
    image:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Magical Wedding at Taj Aguada Fort, Goa",
    excerpt:
      "Nestled amidst the stunning landscapes of Goa, where the Arabian Sea kisses golden sands, this Gujarati wedding was a celebration that transcended tradition and elegance.",
    image:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Meera & Aarav's Palace Wedding in Jaipur",
    excerpt:
      "A celebration wrapped in marigolds, candlelit courtyards, and music that carried through the palace halls, their wedding felt royal without ever losing its warmth.",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Nisha & Dev's Elegant Garden Wedding",
    excerpt:
      "Soft florals, honest laughter, and a golden evening ceremony came together in a wedding story full of quiet charm and beautifully personal details.",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Priya & Kabir's Classic Mumbai Reception",
    excerpt:
      "From an emotional mandap ceremony to a high-energy reception night, Priya and Kabir's wedding moved with grace, glamour, and family at its heart.",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=85&w=1200",
  },
];

const destinationStories = [
  {
    title: "Ritu & Mukkul's Jim Corbett wedding at Manu Maharani",
    excerpt:
      "When two souls from different worlds unite in love, the result is nothing short of magical. Their swipe-right moment led to a forever kind of love.",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Kartik & Tanisha : Laxmi Nivas Palace",
    excerpt:
      "When two souls destined for each other come together, magic happens. This wedding at Laxmi Nivas Palace was a celebration of love, elegance, and royal grandeur.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Maitri & Aneesh: Cidade De Goa",
    excerpt:
      "A gorgeous Gujarati wedding at Taj Cidade de Goa took place overlooking the Arabian Sea, atop a small hill, high on emotion and coastal beauty.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Aditi & Rohan's Udaipur Lake Wedding",
    excerpt:
      "Set against still blue water and old-world architecture, their destination wedding blended intimate rituals, sunset portraits, and a celebration that glowed after dark.",
    image:
      "https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Kiara & Arjun: Beachside Vows in Phuket",
    excerpt:
      "A breezy coastal celebration with barefoot vows, tropical florals, and a reception under the stars made this destination wedding feel effortless and cinematic.",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=85&w=1200",
  },
  {
    title: "Sanya & Viren's Tuscan Villa Celebration",
    excerpt:
      "Rolling vineyards, long-table dinners, and golden countryside light shaped a romantic destination wedding story with a soft, editorial mood.",
    image:
      "https://images.unsplash.com/photo-1529634897087-143525e0d39b?auto=format&fit=crop&q=85&w=1200",
  },
];

function StoryCard({ story }) {
  return (
    <article className="wedding-story-card">
      <a href="#" className="wedding-story-image-link" aria-label={`Read ${story.title}`}>
        <img src={story.image} alt={story.title} className="wedding-story-image" loading="lazy" />
      </a>
      <div className="wedding-story-copy">
        <h3>{story.title}</h3>
        <p>{story.excerpt}</p>
      </div>
    </article>
  );
}

function StoryRow({ title, stories }) {
  return (
    <section className="wedding-stories-row" aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>
      <div className="wedding-stories-heading">
        <h2 id={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>
          <span>{title.split(" ")[0]}</span> {title.split(" ").slice(1).join(" ")}
        </h2>
        <div className="wedding-stories-controls" aria-hidden="true">
          {/* <button type="button" aria-label="Previous stories">
            <ChevronLeft size={18} strokeWidth={1.2} />
          </button>
          <button type="button" aria-label="Next stories">
            <ChevronRight size={18} strokeWidth={1.2} />
          </button> */}
        </div>
      </div>

      <div className="wedding-stories-grid">
        {stories.map((story) => (
          <StoryCard key={story.title} story={story} />
        ))}
      </div>
    </section>
  );
}

export default function WeddingStories() {
  return (
    <main id="wedding-stories" className="wedding-stories-page">
      <StoryRow title="Most Popular Weddings" stories={popularStories} />
      <StoryRow title="Destination Weddings" stories={destinationStories} />
    </main>
  );
}
