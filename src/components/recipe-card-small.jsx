import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
const RecipeCardSmall = ({ recipe, isChild = false }) => {
  const navigate = useNavigate();
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;

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
    <div className="flex flex-col justify-between gap-0 px-2 py-3 border-b bg-white hover:bg-secondary last:border-none transition-colors ease-in-out duration-300">
      <div className="flex justify-between items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => navigate(`/recipes/${recipe._id}`)}
              className="cursor-pointer hover:text-accent text-md font-bold line-clamp-1 text-card-foreground antialiased"
            >
              {recipe.title}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p> {recipe.title}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="cursor-pointer" size="icon">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleFavorite} className="cursor-pointer">
              {favorite ? 'Unsave' : 'Save'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemixClick} className="cursor-pointer">
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
    </div>
  );
};

export default RecipeCardSmall;
