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
import { Badge } from '@/components/ui/badge';

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
        />{' '}
        <div className="absolute top-4 left-4 flex text-center gap-2 items-center">
          <Badge>{dishTypeLabels[recipe.dishType] ?? recipe.dishType}</Badge>
          <Badge className="bg-white" variant="outline">
            {cookingTimeLabels[recipe.cookingTime] ?? recipe.cookingTime}
          </Badge>
        </div>
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
              <div className="hover:text-accent text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
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
        <div className="flex justify-start items-center gap-2 mt-0 text-sm text-gray-500 mb-4">
          <div className="font-normal text-gray-500 group-hover:text-current">
            <span>0 likes</span>
          </div>{' '}
          <div className="font-normal text-gray-500 group-hover:text-current">
            <span>0 likes</span>
          </div>
        </div>
        <Separator className="flex mt-4 mb-2" />
        {/* Buttons */}
        <div className=" w-full flex justify-center gap-3">
          <Button disabled={true} variant="ghost" className="group cursor-pointer flex-1 flex">
            <Heart className={`transition`} />
          </Button>

          <Button disabled={true} variant="ghost" className="group cursor-pointer flex-1 flex">
            <MessageCircle className="" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCardPreview;
