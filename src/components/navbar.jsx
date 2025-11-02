import React, { useEffect, useState, useMemo } from "react";
import logo from "@/assets/images/Recipedia-logo-square.svg";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NotificationPopover } from "./notification-popover";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={"/"} className="flex flex-1">
            <img src={logo} alt="Recipedia Logo" className="h-12" />
          </Link>
          {/* Right section */}{" "}
          {user ? (
            <div className="flex flex-1 items-center gap-2 justify-end">
              {/* Create Recipe */}
              <Link to={"/create"}>
                <Button variant="ghost" className="cursor-pointer">
                  <Plus className="" />
                  Post
                </Button>
              </Link>
              <NotificationPopover />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={
                        user?.avatar ||
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
                  <DropdownMenuLabel className="truncate">
                    {user.name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    My Kitchen
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/customize-avatar")}
                  >
                    Dress Your Chef
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/analytics")}
                  >
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/change-password")}
                  >
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2 justify-end">
              <Link to={"/login"}>
                <Button variant="outline" className="cursor-pointer">
                  {/* <LogIn /> */}
                  Log in
                </Button>
              </Link>
              <Link to={"/signup"}>
                <Button variant="default" className="cursor-pointer">
                  {/* <UserPlus /> */}
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
