import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Heart, Bookmark, MessageCircle, ChefHat, TrendingUp } from 'lucide-react';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/formatDate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import PreviewImg from '@/assets/images/image.jpg';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;

const RecipeCardPreview = ({ recipe }) => {
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
        />
      </div>

      {/* Content */}
      <CardContent className="p-4 h-fit">
        {/* Author + Date */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="cursor-pointer">
              <AvatarImage src={avatarUrl} alt={authorName} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <div className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
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
        <h2 className="cursor-pointer hover:text-accent text-xl font-bold line-clamp-1 text-[var(--card-foreground)] mt-1 mb-0 antialiased">
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
          <Button disabled={true} variant="ghost" className="group cursor-pointer flex-1 flex">
            <Heart className={`transition`} />
            <div className="font-normal text-gray-500 group-hover:text-current">
              <span>0</span>
            </div>
          </Button>

          <Button disabled={true} variant="ghost" className="group cursor-pointer flex-1 flex">
            <MessageCircle className="" />
            <div className="font-normal text-gray-500 group-hover:text-current">
              <span>0</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCardPreview;
