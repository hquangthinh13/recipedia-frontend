import React from "react";
import { Separator } from "@/components/ui/separator";
import GitHubLogo from "@/assets/images/GitHub-logo.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-6 bottom-0 px-4 max-w-6xl overflow-hidden mx-auto">
      <div className="flex flex-col items-center justify-center px-6 pt-6 pb-12 bg-primary rounded-t-md">
        {/* Row 1 */}
        <div className="mt-0 flex flex-row w-full items-center justify-between">
          <div className="flex flex-row w-full items-center justify-start gap-6 text-sm text-white font-normal">
            <Link
              to={"/"}
              className="cursor-pointer transition-all delay-150 duration-200 ease-in-out hover:tracking-widest"
            >
              HOME
            </Link>
            <Link className="cursor-pointer transition-all delay-150 duration-200 ease-in-out hover:tracking-widest">
              EXPLORE
            </Link>
            <Link className="cursor-pointer transition-all delay-150 duration-200 ease-in-out hover:tracking-widest">
              ABOUT
            </Link>
          </div>
        </div>
        <Separator className="mt-6 mb-6" />
        {/* Row 2 */}
        <div className="mt-0 flex flex-row w-full items-start justify-between">
          <span className="text-white text-xs tracking-wide">
            © 2025 Recipedia.
          </span>
          <Link to={"https://github.com/hquangthinh13/Recipedia-frontend.git"}>
            <img src={GitHubLogo} className="cursor-pointer h-6 w-6" />{" "}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
