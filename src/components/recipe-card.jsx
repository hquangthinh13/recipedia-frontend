import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Heart, Bookmark, MessageCircle, ChefHat } from "lucide-react";
import { dishTypeLabels, cookingTimeLabels } from "../lib/enumDisplayMap";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/formatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getDicebearAvatar = (seed) =>
  `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
    seed || "U"
  )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const commentCount = recipe.comments?.length || 0;

  const { user } = useAuth();
  const userId = user?.id;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [liked, setLiked] = useState(recipe.likedByUser || false);
  const [likeCount, setLikeCount] = useState(recipe.likes?.length || 0);

  useEffect(() => {
    if (!userId || !recipe?.likes) {
      setLiked(false);
      return;
    }

    // recipe.likes is an array of ObjectIds
    const userHasLiked = recipe.likes.some(
      (id) =>
        id.toString() === userId.toString() ||
        (id._id && id._id.toString() === userId.toString())
    );

    setLiked(userHasLiked);
  }, [userId, recipe.likes]);

  const [favorite, setFavorite] = useState(
    user?.favorites?.some((id) => id === recipe._id || id._id === recipe._id) ||
      false
  );

  const handleLike = async () => {
    // Only block when we definitively know the user isn't logged in
    if (!token) {
      toast.error("Please log in to like recipes.");
      return;
    }

    try {
      const res = await api.post(`/recipes/${recipe._id}/like`);
      setLiked(res.data.likedByUser);
      setLikeCount(res.data.likesCount);
    } catch (error) {
      toast.error("Failed to update like status");
      console.error(error);
    }
  };

  const handleFavorite = async () => {
    try {
      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      setFavorite(res.data.isFavorite);
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to update favorites");
      console.error(error);
    }
  };
  // Keep favorite state in sync when user or recipe changes
  useEffect(() => {
    if (user?.favorites && recipe?._id) {
      const isFav = user.favorites.some(
        (id) => id === recipe._id || id._id === recipe._id
      );
      setFavorite(isFav);
    }
  }, [user, recipe]);

  return (
    <Card className="mx-auto w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out hover:translate-y-0.5 hover:scale-105">
      {/* Cover image */}
      <Link to={`/recipes/${recipe._id}`}>
        <div className="cursor-pointer  ">
          <img
            src={recipe.coverImage || "https://via.placeholder.com/300"}
            alt={recipe.title}
            className="h-36 w-full object-cover"
            //  transition ease-in-out delay-150 duration-300 hover:scale-105
          />
        </div>{" "}
      </Link>

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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{formatDate(recipe.createdAt)}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{new Date(recipe.createdAt).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer"
            onClick={handleFavorite}
          >
            <Bookmark
              className={`transition ${
                favorite &&
                "fill-secondary-foreground text-secondary-foreground"
              }`}
            />
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
            onClick={handleLike}
            // size="icon"
            variant="ghost"
            className="group cursor-pointer flex-1 flex"
          >
            <Heart
              className={`transition ${liked && "fill-primary text-primary"}`}
            />{" "}
            {/* {likeCount} */}
            <div className="font-normal text-gray-500 group-hover:text-current">
              <span>{likeCount || 0}</span>
            </div>
          </Button>

          <Button
            // size="icon"
            variant="ghost"
            className="group cursor-pointer flex-1 flex"
            onClick={() =>
              navigate(`/recipes/${recipe._id}`, {
                state: { scrollToComment: true },
              })
            }
          >
            <MessageCircle className="" />

            <div className="font-normal text-gray-500 group-hover:text-current">
              <span>{commentCount}</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
