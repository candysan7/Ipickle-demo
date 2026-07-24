import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import home1 from '../assets/home/home_1.jpg';
import home2 from '../assets/home/home_2.jpg';
import home3 from '../assets/home/home_3.jpg';
import home4 from '../assets/home/home_4.jpg';

const slides = [
  { src: home1, caption: 'Members playing on our courts' },
  { src: home2, caption: 'Weekly socials & tournaments' },
  { src: home3, caption: 'Group classes for every level' },
  { src: home4, caption: 'Six locations across SoCal' },
];

export default function HomeSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="relative h-72 sm:h-96 lg:h-[30rem] w-full overflow-hidden rounded-3xl shadow-lg bg-stone-200">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
          />
          <img
            src={slide.src}
            alt={slide.caption}
            className="relative w-full h-full object-contain"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <p className="absolute bottom-5 left-6 text-white font-semibold text-sm sm:text-base drop-shadow">
        {slides[index].caption}
      </p>

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-5 right-6 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
