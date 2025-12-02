import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Bookmark, MessageCircle, SquarePen, Trash, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;

const RecipeCardHorizontal = ({ recipe, isOwner = false, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const commentCount = recipe.comments?.length || 0;
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const authorName = recipe?.author?.name || 'Mysterious Chef';
  const { user, setUser } = useAuth();
  const userId = user?.id;
  const { token } = useAuth();
  const [liked, setLiked] = useState(recipe.likedByUser || false);
  const [likeCount, setLikeCount] = useState(recipe.likes?.length || 0);
  const remixCount = recipe.remixCount || 0;
  const isRemix = recipe?.parentRecipe;
  const [expanded, setExpanded] = useState(false);

  const [favorite, setFavorite] = useState(
    user?.favorites?.some((id) => id === recipe._id || id._id === recipe._id) || false,
  );
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!token) {
      setLiked(false);
      setFavorite(false);
    }
  }, [token]);
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
  const handleRemixClick = () => {
    if (!user) {
      toast.error('Please log in to remix this recipe');
      navigate('/login', { state: { from: `/recipes/${recipe._id}` } });
      return;
    }

    // navigate(`/recipes/${recipe._id}/remix`);
    navigate(`/remix/${recipe._id}`);
  };
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/recipes/${recipe._id}`);
      setDeleting(false);
      toast.success('Recipe deleted successfully');
      if (onDelete) onDelete(recipe._id); // tell parent to update
    } catch (error) {
      setDeleting(false);
      toast.error('Failed to delete recipe');
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.favorites && recipe?._id) {
      const isFav = user.favorites.some((id) => id === recipe._id || id._id === recipe._id);
      setFavorite(isFav);
    }
  }, [user, recipe]);

  return (
    <Card className="mx-auto h-fit w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      {/* Content */}
      <CardContent className="p-4 h-fit">
        {/* Author + Date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${recipe.author?._id}`} className="cursor-pointer">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              <Link to={`/profile/${recipe.author?._id}`}>
                <div className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
                  {recipe.author?.name || 'Mysterious Chef'}
                </div>
              </Link>
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
          {isOwner ? (
            <div className="flex justify-center gap-2">
              {/* Delete */}

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="cursor-pointer">
                    <Trash />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete recipe?</DialogTitle>
                    <DialogDescription>
                      Once deleted, you won’t be able to recover it.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-2">
                    <DialogClose asChild>
                      <Button className="cursor-pointer" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      disabled={deleting}
                      className="cursor-pointer"
                      variant="destructive"
                      onClick={handleDelete}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit */}
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => onEdit && onEdit(recipe)} // trigger parent modal
              >
                <SquarePen />
              </Button>
            </div>
          ) : (
            <>
              {' '}
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={handleFavorite}
              >
                <Bookmark className={`transition ${favorite && 'fill-primary text-primary'}`} />
              </Button>
            </>
          )}
        </div>
        {/* Title */}{' '}
        <Link to={`/recipes/${recipe._id}`}>
          <h2 className="cursor-pointer hover:text-accent text-2xl font-bold line-clamp-1 text-card-foreground mt-2 mb-0 antialiased">
            {recipe.title}
          </h2>
        </Link>
        <div className="flex justify-start items-center gap-2 mt-2 text-sm mb-4">
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
        <p
          className={`text-md text-muted-foreground transition-all duration-300 whitespace-pre-line ${
            expanded ? '' : 'line-clamp-4'
          }`}
        >
          {recipe.instructions}
        </p>{' '}
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline cursor-pointer hover:text-accent text-md font-medium text-primary hover:underline mb-4"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
        {/* Cover image */}
        <Link to={`/recipes/${recipe._id}`}>
          <div className="cursor-pointer aspect-video overflow-hidden rounded-md">
            <img
              src={recipe.coverImage}
              alt={recipe.title}
              className="object-cover w-full h-full object-center transition ease-in-out delay-150 duration-300 hover:scale-105"
            />
          </div>
        </Link>
        <Separator className="flex mt-4 mb-2" />
        {/* Buttons */}
        <div className=" w-full flex justify-center gap-3">
          <Button onClick={handleLike} variant="ghost" className="group cursor-pointer flex-1 flex">
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
      </CardContent>
    </Card>
  );
};

export default RecipeCardHorizontal;
