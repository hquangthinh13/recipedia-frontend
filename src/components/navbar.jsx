import React, { useEffect, useState, useMemo } from "react";
import logo from "../assets/images/Recipedia-logo-square.svg";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// helpers (put near top of file)
const getDicebearAvatar = (seed) =>
  `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
    seed || "U"
  )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;

// stable random seed per session for guests
function getGuestSeed() {
  const key = "guestAvatarSeed";
  let seed = sessionStorage.getItem(key);
  if (!seed) {
    // create a short random seed
    const n = crypto.getRandomValues(new Uint32Array(1))[0];
    seed = `guest-${n.toString(36)}`;
    sessionStorage.setItem(key, seed);
  }
  return seed;
}

function getInitials(nameOrEmail = "") {
  const base = nameOrEmail.split("@")[0];
  const parts = base.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={"/"}>
            <img src={logo} alt="Recipedia Logo" className="h-14" />
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-1">
            {/* Create Recipe */}
            <Link to={"/create"}>
              <Button variant="ghost" className="cursor-pointer">
                <Plus className="mr-1" />
                Post
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="default" className="cursor-pointer">
              <Bell />
            </Button>

            {/* Auth area */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={
                      user?.avatarUrl ||
                      getDicebearAvatar(
                        user?.name || user?.email || getGuestSeed()
                      )
                    }
                    alt={user?.name || user?.email || "Guest"}
                  />
                  {/* Fallback uses DiceBear too */}
                  <AvatarFallback className="p-0">
                    <img
                      alt="avatar-fallback"
                      className="h-full w-full object-cover"
                      src={getDicebearAvatar(
                        user?.name || user?.email || getGuestSeed()
                      )}
                    />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48" align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel className="truncate">
                      {user.name || user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="truncate">
                      Guest
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* No login button in the navbar; keep a menu action if you still want a path to login */}
                    <DropdownMenuItem onClick={() => navigate("/login")}>
                      Log in
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
