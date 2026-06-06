import React from "react";

const instagramPosts = [
  {
    id: 1,
    alt: "Editorial beach wedding portrait",
    image:
      "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.05_PM_1_oq9zbj.jpg",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
  {
    id: 2,
    alt: "Bride portrait beside white curtains",
    image:
      "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480770/WhatsApp_Image_2026-06-01_at_7.21.05_PM_cstom2.jpg",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
  {
    id: 3,
    alt: "Wedding couple ceremony detail",
    image:
      "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480767/WhatsApp_Image_2026-06-01_at_7.21.03_PM_1_ot69ar.jpg",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
  {
    id: 4,
    alt: "Bride and groom wedding moment",
    image:
      "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.02_PM_1_egzcau.jpg",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
  {
    id: 5,
    alt: "Wedding staircase detail",
    image:
      "https://res.cloudinary.com/dx8zo5ukg/image/upload/q_auto/f_auto/v1780480769/WhatsApp_Image_2026-06-01_at_7.21.06_PM_1_jphxva.jpg",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
  {
    id: 6,
    alt: "Couple portrait in warm light",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop",
    href: "https://www.instagram.com/tkmomentscapture?igsh=MWFuaGgyMDBiYzN4bQ==",
  },
];

const Instagram = () => {
  return (
    <section
      id="instagram"
      className="overflow-hidden bg-[#f8e5c7] px-5 py-14 sm:px-6 sm:py-24 lg:px-10"
    >
      <div className="mx-auto max-w-[1460px]">
        <h2 className="mx-auto mb-9 w-full text-center font-serif text-[clamp(2.35rem,12vw,4.5rem)] font-normal uppercase leading-none tracking-[0.24em] text-black sm:mb-12 sm:tracking-[0.42em] lg:tracking-[0.58em]">
          Instagram
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noreferrer"
              aria-label="Open tk moments capture on Instagram"
              className="group block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white/30 sm:rounded-[18px]"
            >
              <img
                src={post.image}
                alt={post.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Instagram;
