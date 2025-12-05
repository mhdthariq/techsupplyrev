"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  active: boolean;
  position: number;
}

interface CarouselProps {
  banners: Banner[];
  autoplay?: boolean;
  autoplayInterval?: number;
}

export default function Carousel({
  banners = [],
  autoplay = true,
  autoplayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1,
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1,
    );
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;

    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, autoplayInterval, banners.length]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (autoplay) setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    if (autoplay) setIsPlaying(true);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-linear-to-r from-gray-200 to-gray-300 md:h-[500px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-full w-full shrink-0">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${banner.image_url})`,
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center text-white">
                <h2 className="mb-4 text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
                  {banner.title}
                </h2>
                {banner.description && (
                  <p className="mb-8 text-lg leading-relaxed text-white/90 md:text-xl lg:text-2xl">
                    {banner.description}
                  </p>
                )}
                {banner.link && (
                  <Link
                    href={banner.link}
                    className="inline-flex transform items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-gray-100"
                  >
                    Shop Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/50"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white/50"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full shadow-md transition-all duration-200 ${
                index === currentIndex
                  ? "scale-125 bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Play/Pause button (optional) */}
      {autoplay && banners.length > 1 && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 right-4 rounded-full bg-white/30 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/50"
          aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
