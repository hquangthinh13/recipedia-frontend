import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import img1 from "@/assets/images/image.jpg";
import img2 from "@/assets/images/image0.jpg";
import img3 from "@/assets/images/image1.jpg";
import img4 from "@/assets/images/image2.jpg";

const CarouselBanner = () => {
  const images = [img1, img2, img3, img4];

  return (
    <div className="relative group w-full ">
      {/* Carousel */}
      <Carousel
        plugins={[
          Autoplay({
            delay: 3000, // 3 seconds between slides
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]}
        opts={{
          loop: true, // makes the carousel loop infinitely
        }}
        className="w-full h-48 overflow-hidden rounded-lg"
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className=" w-full h-auto object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Buttons (on-hover + hide when disabled) */}
        <CarouselPrevious className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded-full disabled:hidden" />
        <CarouselNext className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded-full disabled:hidden" />
      </Carousel>
    </div>
  );
};

export default CarouselBanner;
