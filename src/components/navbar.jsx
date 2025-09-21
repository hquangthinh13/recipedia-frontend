import React from "react";
import logo from "../assets/images/Recipedia-logo-square.svg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react"; // for icons (shadcn uses lucide-react)
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={"/"}>
            <img src={logo} alt="Recipedia Logo" className="h-14" />
          </Link>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Create Recipe */}
            <Link to={"/create"}>
              <Button variant="ghost" className="cursor-pointer">
                <Plus className="size=lg" />
                Post
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="default" className="cursor-pointer">
              <Bell className="" />
            </Button>

            {/* Profile Avatar */}
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
            </Avatar>
            {/* <Button variant="ghost" size="icon" className="rounded-full p-0">
              <img
                asChild
                src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"
                alt="User Avatar"
                className="rounded-full object-cover"
              />
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
