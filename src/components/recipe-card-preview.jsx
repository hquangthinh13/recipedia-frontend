import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Heart, Bookmark, MessageCircle, ChefHat, TrendingUp, Repeat } from 'lucide-react';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PreviewImg from '@/assets/images/overcooked0.jpg';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Badge } from '@/components/ui/badge';

const RecipeCardPreview = ({ recipe, isRemix = false }) => {
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const authorName = recipe?.author?.name || 'Mysterious Chef';

  return (
    <Card className="mx-auto w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      {/* Cover image */}
      <div className="cursor-pointer overflow-hidden relative">
        <img
          src={recipe.coverImage || PreviewImg}
          alt={recipe.title}
          className=" h-36 w-full object-cover
             transition ease-in-out delay-150 duration-300 hover:scale-105"
        />{' '}
        <span
          className="z-0 absolute inset-0 bg-gradient-to-b via-black/0 to-black/50 brightness-100
             transition-colors duration-500 group-hover:via-black/0 group-hover:to-black/20"
        ></span>
      </div>

      {/* Content */}
      <CardContent className="p-4 h-fit">
        {/* Author + Date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="">
              <AvatarImage src={avatarUrl} alt={authorName} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-card-foreground">
                {recipe.author?.name || 'Mysterious Chef'}
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

          <Button disabled={true} size="icon" variant="ghost" className="cursor-pointer">
            <Bookmark className={`transition`} />
          </Button>
        </div>
        <h2 className="cursor-pointer hover:text-accent text-2xl font-bold line-clamp-1 text-[var(--card-foreground)] mt-2 mb-4 antialiased">
          {recipe.title}
        </h2>
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

        <Separator className="flex mt-2 mb-2" />

        {/* Buttons */}
        <div className=" w-full flex justify-center gap-3">
          <Button disabled={true} variant="ghost" className="group cursor-pointer flex-1 flex">
            <Heart />
          </Button>

          <Button variant="ghost" className="group cursor-pointer flex-1 flex" disabled={true}>
            <MessageCircle className="" />
          </Button>

          <Button variant="ghost" className="group cursor-pointer flex-1 flex" disabled={true}>
            <Repeat className="" />
          </Button>
        </div>
        <div className="flex justify-center items-center gap-2 mt-2 text-xs text-muted-foreground">
          <div className="flex flex-1 font-normal justify-center">
            <span>0 like</span>
          </div>{' '}
          <div className="flex flex-1 justify-center font-normal">
            <span>0 comment</span>
          </div>
          <div className="flex flex-1 justify-center font-normal">
            <span>0 remix</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCardPreview;
