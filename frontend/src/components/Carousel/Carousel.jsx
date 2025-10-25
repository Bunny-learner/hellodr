import React, { useState } from 'react';
import logo1 from '../../assets/carousel-images/Academic-About.e6a203bff9b9d7dd0d81.jpg';
import logo2 from '../../assets/carousel-images/banner-01.jpg';
import logo3 from '../../assets/carousel-images/campus.jpg';
import logo4 from '../../assets/carousel-images/image4.jpg'


const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [logo1, logo2, logo3, logo4];

  const handleNext = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
  };

  return (
    <div
      id="carouselExample"
      className="relative mx-auto max-w-none inline-block" // inline-block to shrink-wrap content
      data-carousel="slide"
    >
      {/* Carousel indicators */}
      <div className="absolute top-0 left-0 z-30 flex space-x-3 justify-center p-4 w-full">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 bg-white rounded-full dark:bg-gray-800 ${currentSlide === index ? 'bg-blue-500' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Carousel items */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="duration-700 ease-in-out">
          <img
            src={images[currentSlide]}
            className="block max-w-full h-auto object-cover" // natural size or scale to container width
            alt={`Image ${currentSlide + 1}`}
          />
        </div>
      </div>

      {/* Carousel controls */}
      <button
        type="button"
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={handlePrev}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 text-white rounded-full bg-black/30 group-hover:bg-black/50 group-focus:ring-4 group-focus:ring-black/50">
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            x="0"
            y="0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={handleNext}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 text-white rounded-full bg-black/30 group-hover:bg-black/50 group-focus:ring-4 group-focus:ring-black/50">
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            x="0"
            y="0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
};


export default Carousel;
