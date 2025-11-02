import React from "react";
import { ArrowUpRight } from "lucide-react";
import img1 from "@/assets/images/overcooked3.jpg";
import img2 from "@/assets/images/overcooked0.jpg";
import img3 from "@/assets/images/overcooked2.jpg";

const HomeLinkCard = ({ index, title }) => {
  // Pick background image based on index
  const backgrounds = [img1, img2, img3];
  const background = backgrounds[(index - 1) % backgrounds.length];

  return (
    <div
      className="group relative flex flex-col justify-between h-fit
                 cursor-pointer overflow-hidden rounded-md transition-all duration-300 ease-in-out
                  flex-1"
    >
      {/* Background image with zoom on hover */}
      <img
        src={background}
        alt={`Banner ${index}`}
        className="absolute inset-0 w-full h-full object-cover
                   transition-transform duration-500 ease-out group-hover:scale-110"
      />

      {/* Overlay darkens on hover */}
      <span
        className="absolute inset-0 bg-black/30 transition-colors duration-500
                   group-hover:bg-black/50"
      ></span>

      {/* Text and icon */}
      <div className="min-h-28 lg:min-h-32 relative z-10 flex flex-row justify-between flex-1 p-4 gap-2 text-white">
        <span className="flex flex-col flex-1 md:w-2/3 justify-center md:justify-start text-xl sm:text-xl md:text-2xl font-medium">
          {title}
        </span>
        <div className="flex flex-col md:flex-1 justify-center md:justify-end items-end">
          <ArrowUpRight
            className="w-5 h-5 sm:w-7 sm:h-7 text-white 
                       transition-transform duration-500 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeLinkCard;
