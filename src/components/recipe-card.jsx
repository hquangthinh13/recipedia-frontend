import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CakeSlice,
  Heart,
  Bookmark,
  MessageCircle,
  ChefHat,
} from "lucide-react";
import { dishTypeLabels, cookingTimeLabels } from "../lib/enumDisplayMap";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Helper: format date
const formatPostedDate = (createdAt) => {
  const now = new Date();
  const posted = new Date(createdAt);
  const diffMs = now - posted;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 3) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return posted.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

const getDicebearAvatar = (seed) =>
  `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
    seed || "U"
  )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;

const RecipeCard = ({ recipe }) => {
  const avatarUrl =
    recipe.author?.avatar ||
    `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
      recipe.author?.username || "U"
    )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;
  return (
    <Link to={`/recipes/${recipe._id}`}>
      <Card className="cursor-pointer mx-auto w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out hover:translate-y-0.5 hover:scale-105">
        {/* Cover image */}
        <div className=" ">
          <img
            src={recipe.coverImage || "https://via.placeholder.com/300"}
            alt={recipe.title}
            className="h-36 w-full object-cover"
          />
        </div>

        {/* Content */}
        <CardContent className="p-4 h-fit">
          {/* Author + Date */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={
                    recipe.author?.avatarUrl ||
                    getDicebearAvatar(
                      recipe.author?.username || recipe.author?.name || "U"
                    )
                  }
                  alt={recipe.author?.username || recipe.author?.name || "User"}
                />
                <AvatarFallback>
                  {recipe.author?.username?.[0]?.toUpperCase() ||
                    recipe.author?.name?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
                  {recipe.author?.name || "Mysterious Chef"}
                </div>
                <div className="text-xs flex text-[var(--muted-foreground)] font-light">
                  {formatPostedDate(recipe.createdAt)}
                </div>
              </div>
            </div>

            <Button size="icon" variant="ghost" className="cursor-pointer">
              <Bookmark className="" />
            </Button>
          </div>
          {/* Title */}
          <h2 className="text-xl font-bold line-clamp-1 text-[var(--card-foreground)] mt-1 mb-0 antialiased">
            {recipe.title}
          </h2>

          {/* Dish type + Cooking time */}
          <div className="flex justify-start items-center gap-3 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-gray-400 " />
              <span className="text-base text-gray-600 antialiased">
                {dishTypeLabels[recipe.dishType] ?? recipe.dishType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400 " />
              <span className="text-base text-gray-600 antialiased">
                {cookingTimeLabels[recipe.cookingTime] ?? recipe.cookingTime}
              </span>
            </div>
          </div>

          <Separator className="flex mt-4 mb-2" />
          {/* Buttons */}
          <div className=" w-full flex justify-center gap-3">
            <Button
              // size="icon"
              variant="ghost"
              className="group cursor-pointer flex-1 flex"
            >
              <Heart className="" />
              {/* <div className="font-normal text-gray-300 group-hover:text-current">
              {recipe.likes.length}
            </div> */}
            </Button>

            <Button
              // size="icon"
              variant="ghost"
              className="group cursor-pointer flex-1 flex"
            >
              <MessageCircle className="" />
              {/* <div className="font-normal text-gray-300 group-hover:text-current">
              {recipe.likes.length}
            </div> */}
            </Button>
          </div>
        </CardContent>
      </Card>{" "}
    </Link>
  );
};

export default RecipeCard;
