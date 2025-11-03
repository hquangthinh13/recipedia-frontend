import React from "react";
import pattern from "@/assets/images/Recipedia_Pattern.svg";
import patternMobile from "@/assets/images/Recipedia_Pattern_Mobile.svg";
const Pattern = () => {
  return (
    <div className="max-w-6xl px-4 py-2 items-center justify-center mx-auto mt-2">
      <img src={pattern} alt="Pattern" className="hidden lg:flex w-full" />
      <img src={patternMobile} alt="Pattern" className="lg:hidden w-full" />
    </div>
  );
};

export default Pattern;
