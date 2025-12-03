import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark, MessageCircle, TrendingUp, Repeat } from 'lucide-react';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Badge } from '@/components/ui/badge';

const RecipeCard = ({ isTrending, recipe }) => {
  const navigate = useNavigate();
  const commentCount = recipe.comments?.length || 0;
  const remixCount = recipe.remixCount || 0;
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const authorName = recipe?.author?.name || 'Mysterious Chef';
  const isRemix = recipe?.parentRecipe;
  const { user, setUser } = useAuth();

  const userId = user?.id;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [liked, setLiked] = useState(recipe.likedByUser || false);
  const [likeCount, setLikeCount] = useState(recipe.likes?.length || 0);
  const handleRemixClick = () => {
    if (!user) {
      toast.error('Please log in to remix this recipe');
      // navigate('/login', { state: { from: `/recipes/${recipe._id}` } });
      return;
    }

    // navigate(`/recipes/${recipe._id}/remix`);
    navigate(`/remix/${recipe._id}`);
  };
  useEffect(() => {
    if (!userId || !recipe?.likes) {
      setLiked(false);
      return;
    }

    // recipe.likes is an array of ObjectIds
    const userHasLiked = recipe.likes.some(
      (id) =>
        id.toString() === userId.toString() || (id._id && id._id.toString() === userId.toString()),
    );

    setLiked(userHasLiked);
  }, [userId, recipe.likes]);

  const [favorite, setFavorite] = useState(
    user?.favorites?.some((id) => id === recipe._id || id._id === recipe._id) || false,
  );

  const handleLike = async () => {
    // Only block when we definitively know the user isn't logged in
    if (!token) {
      toast.error('Please log in to like recipes');
      return;
    }
    try {
      const res = await api.post(`/recipes/${recipe._id}/like`);
      setLiked(res.data.likedByUser);
      setLikeCount(res.data.likesCount);
    } catch (error) {
      toast.error('Failed to update like status');
      console.error(error);
    }
  };

  const handleFavorite = async () => {
    if (!token) {
      toast.error('Please log in to save this recipe');
      return;
    }
    try {
      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      setFavorite(res.data.isFavorite);
      toast.success(res.data.message);

      // Update global user favorites so both pages sync
      setUser((prev) => {
        if (!prev) return prev;
        const updatedFavorites = res.data.isFavorite
          ? [...prev.favorites, recipe._id] // add
          : prev.favorites.filter((id) => id !== recipe._id); // remove
        return { ...prev, favorites: updatedFavorites };
      });
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error(error);
    }
  };

  // Keep favorite state in sync when user or recipe changes
  useEffect(() => {
    if (user?.favorites && recipe?._id) {
      const isFav = user.favorites.some((id) => id === recipe._id || id._id === recipe._id);
      setFavorite(isFav);
    }
  }, [user, recipe]);

  return (
    <Card className="mx-auto w-full h-full flex flex-col  hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      {/* Cover image */}
      <div
        className="group cursor-pointer overflow-hidden relative transition-all duration-300 ease-in-out"
        onClick={() => navigate(`/recipes/${recipe._id}`)}
      >
        <img
          src={recipe.coverImage}
          alt={recipe.title}
          className="aspect-video w-full object-cover
             transition ease-in-out delay-150 duration-300 group-hover:scale-105"
        />
        {/* <img src={avatarNoBg} className="h-32 absolute z-21 bottom-0 right-4"></img> */}
        {isTrending && (
          <div className="z-20 text-xs absolute top-4 left-4 bg-primary text-white rounded-full px-2 py-1 flex text-center items-center shadow-xl">
            <TrendingUp className="w-4 h-4 mr-1" /> Hot Recipe
          </div>
        )}
        {isTrending && (
          <span
            className="z-0 absolute inset-0 bg-linear-to-tr via-accent/10 to-accent/50 brightness-100
             transition-colors duration-500 group-hover:via-accent/30 group-hover:to-accent/50"
          ></span>
        )}
        <span
          className="z-0 absolute inset-0 bg-linear-to-b via-black/0 to-black/50 brightness-100
             transition-colors duration-500 group-hover:via-black/0 group-hover:to-black/20"
        ></span>
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            {/* Author + Date */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar
                  className="cursor-pointer"
                  onClick={() => navigate(`/profile/${recipe.author?._id}`)}
                >
                  <AvatarImage src={avatarUrl} alt={authorName} />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div
                    onClick={() => navigate(`/profile/${recipe.author?._id}`)}
                    className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-card-foreground"
                  >
                    {recipe.author?.name || 'Mysterious Chef'}
                  </div>
                  <div className="text-xs flex text-muted-foreground font-light">
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
                <Bookmark className={`transition ${favorite && 'fill-primary text-primary'}`} />
              </Button>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <h2
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                  className="cursor-pointer hover:text-accent text-2xl font-bold line-clamp-1 text-card-foreground mt-2 mb-0 antialiased"
                >
                  {recipe.title}
                </h2>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                <p> {recipe.title}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex flex-wrap justify-start items-center gap-2 mt-2 text-sm mb-4">
              <Badge variant="default">{dishTypeLabels[recipe.dishType] ?? recipe.dishType}</Badge>
              <Badge variant="secondary">
                {cookingTimeLabels[recipe.cookingTime] ?? recipe.cookingTime}
              </Badge>
              {/* secondary */}
              {isRemix ? (
                <Badge variant="outline">Remixed Recipe</Badge>
              ) : (
                <Badge variant="outline">Original Recipe</Badge>
              )}
            </div>
            {!isTrending && (
              <>
                <p className="text-md text-muted-foreground transition-all duration-300 whitespace-pre-line line-clamp-2">
                  {recipe.instructions}
                </p>
                <button
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                  className="inline cursor-pointer hover:text-accent text-md font-medium text-primary hover:underline mb-4"
                >
                  Read more
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col justify-end">
            <Separator className="flex mt-2 mb-2" />
            {/* Buttons */}
            <div className=" w-full flex justify-center gap-3">
              <Button
                onClick={handleLike}
                variant="ghost"
                className="group cursor-pointer flex-1 flex"
              >
                <Heart className={`transition ${liked && 'fill-primary text-primary'}`} />
              </Button>

              <Button
                variant="ghost"
                className="group cursor-pointer flex-1 flex"
                onClick={() =>
                  navigate(`/recipes/${recipe._id}`, {
                    state: { scrollToComment: true },
                  })
                }
              >
                <MessageCircle className="" />
              </Button>

              <Button
                variant="ghost"
                className="group cursor-pointer flex-1 flex"
                onClick={handleRemixClick}
              >
                <Repeat className="" />
              </Button>
            </div>
            <div className="flex justify-center items-center gap-2 mt-2 text-xs text-muted-foreground">
              <div className="flex flex-1 font-normal justify-center  group-hover:text-current">
                <span>
                  {likeCount || 0} {likeCount > 1 ? 'likes' : 'like'}
                </span>
              </div>{' '}
              <div className="flex flex-1 justify-center font-normal group-hover:text-current">
                <span>
                  {commentCount || 0} {commentCount > 1 ? 'comments' : 'comment'}
                </span>
              </div>
              <div className="flex flex-1 justify-center font-normal group-hover:text-current">
                <span>
                  {remixCount || 0} {remixCount > 1 ? 'remixes' : 'remix'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
