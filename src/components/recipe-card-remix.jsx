import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ellipsis } from 'lucide-react';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Badge } from '@/components/ui/badge';
import { removeBackgroundColor, replaceFaceParams } from '@/lib/avatarModifier';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
const RecipeCardRemix = ({ recipe }) => {
  const navigate = useNavigate();
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const avatarNoBg = removeBackgroundColor(avatarUrl);
  const [faceUrl, setFaceUrl] = useState(replaceFaceParams(avatarUrl));

  const authorName = recipe?.author?.name || 'Mysterious Chef';
  const isRemix = recipe?.parentRecipe;
  const { user, setUser } = useAuth();
  const userId = user?.id;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [liked, setLiked] = useState(recipe.likedByUser || false);
  const handleRemixClick = () => {
    if (!user) {
      toast.error('Please log in to remix this recipe');
      navigate('/login', { state: { from: `/recipes/${recipe._id}` } });
      return;
    }

    navigate(`/recipes/${recipe._id}/remix`);
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

  const handleFavorite = async () => {
    if (!token) {
      toast.error('Please log in first');
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
    <Card className="mx-auto w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      {/* Content */}
      <CardContent className="p-6 h-fit">
        {/* Author + Date */}
        <div className="flex justify-between items-start">
          <div className="flex justify-start flex-col">
            <span className="uppercase text-primary font-normal tracking-widest text-sm">
              {!recipe.parentRecipe ? 'Parent recipe' : 'Remixed from this recipe'}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <h2
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                  className="cursor-pointer hover:text-accent text-xl font-bold line-clamp-1 text-card-foreground antialiased"
                >
                  {recipe.title}
                </h2>
              </TooltipTrigger>
              <TooltipContent>
                <p> {recipe.title}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="cursor-pointer" size="icon">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleFavorite} className="cursor-pointer">
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemixClick} className="cursor-pointer">
                {' '}
                Remix
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-row gap-1 items-center">
            <div
              onClick={() => navigate(`/profile/${recipe.author?._id}`)}
              className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-card-foreground"
            >
              {authorName || 'Mysterious Chef'}
            </div>{' '}
            <span className="text-muted-foreground">•</span>
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

        <div className="flex justify-start items-center mt-2 gap-2">
          <Badge variant="secondary">{dishTypeLabels[recipe.dishType] ?? recipe.dishType}</Badge>
          <Badge variant="secondary">
            {cookingTimeLabels[recipe.cookingTime] ?? recipe.cookingTime}
          </Badge>

          {isRemix ? (
            <Badge variant="outline">Remixed Recipe</Badge>
          ) : (
            <Badge variant="outline">Original Recipe</Badge>
          )}
        </div>
      </CardContent>{' '}
      {/* Cover image */}
      <div
        className="group cursor-pointer overflow-hidden relative transition-all duration-300 ease-in-out"
        onClick={() => navigate(`/recipes/${recipe._id}`)}
      >
        <img
          src={recipe.coverImage}
          alt={recipe.title}
          className="aspect-video w-full object-cover
             transition ease-in-out delay-150 duration-300"
        />
        <div className="absolute bottom-0 right-4 z-20 w-36 h-36 group">
          <img
            src={avatarNoBg}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-10 opacity-100 group-hover:opacity-0"
            alt="Default avatar"
          />
          <img
            src={faceUrl}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-10 opacity-0 group-hover:opacity-100"
            alt="Smiling avatar"
          />
        </div>
      </div>
    </Card>
  );
};

export default RecipeCardRemix;
