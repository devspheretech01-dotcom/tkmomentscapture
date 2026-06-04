const weddingFilms = [
  {
    title: 'More Than a Movie - Riddhi & Dharam\'s "Hasee Toh Phasee" Inspired Pre-Wedding',
    excerpt:
      'They say school-time love is a fleeting thing, but for Riddhi and Dharam, it was just the first chapter of a ten-year-long epic. After a decade of growing up together, sharing dreams, and navigating life side-by-side, it was finally time to capture their forever against the backdrop of the city that witnessed it all: Mumbai.',
    image:
      'https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'From Flower Markets to Pickleball Courts, A Day with Radhika & Ankur',
    excerpt:
      'If we had to describe Ankur and Radhika in one word, it would be irresistible. There is this spark between them, a kind of natural chemistry that makes our cameras absolutely love them.',
    image:
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'A Golden Hour Story with Meera & Aarav',
    excerpt:
      'Soft evening light, quiet laughter, and a city skyline in the distance shaped a couple shoot that felt personal, graceful, and full of warmth.',
    image:
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Nisha & Dev - A Garden Romance',
    excerpt:
      'Between floral walkways and gentle monsoon greens, Nisha and Dev brought an easy charm to a film built around movement, smiles, and small honest moments.',
    image:
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Priya & Kabir - The Classic City Edit',
    excerpt:
      'A polished pre-wedding film with elegant styling, iconic streets, and the kind of effortless chemistry that makes every frame feel cinematic.',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Aditi & Rohan - Lakeside Love in Udaipur',
    excerpt:
      'Shot beside still water and heritage architecture, this film carries the quiet romance of a destination story with a beautifully timeless mood.',
    image:
      'https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Kiara & Arjun - Beachside Frames',
    excerpt:
      'Barefoot walks, sea breeze, and sunset vows inspired a relaxed couple film that moves with the rhythm of the coast.',
    image:
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Sanya & Viren - A Tuscan Dream',
    excerpt:
      'Golden vineyards, slow afternoons, and intimate portraits came together in a destination shoot with a soft editorial finish.',
    image:
      'https://images.unsplash.com/photo-1529634897087-143525e0d39b?auto=format&fit=crop&q=85&w=1400',
  },
  {
    title: 'Ritu & Mukkul - Wild Hearts at Jim Corbett',
    excerpt:
      'Set against forest trails and open skies, their film balances adventure, tenderness, and the unmistakable joy of two people completely at ease.',
    image:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=85&w=1400',
  },
];

function FilmCard({ film }) {
  return (
    <article className="wedding-film-card">
      <a href="#" className="wedding-film-image-link" aria-label={`Watch ${film.title}`}>
        <img src={film.image} alt={film.title} className="wedding-film-image" loading="lazy" />
      </a>
      <div className="wedding-film-copy">
        <h2>{film.title}</h2>
        <p>{film.excerpt}</p>
      </div>
    </article>
  );
}

export default function WeddingFilms() {
  return (
    <main id="wedding-films" className="wedding-films-page">
      <header className="wedding-films-heading">
        <h1>Couple Shoot</h1>
      </header>

      <section className="wedding-films-grid" aria-label="Wedding Films-shoot">
        {weddingFilms.map((film) => (
          <FilmCard key={film.title} film={film} />
        ))}
      </section>
    </main>
  );
}
