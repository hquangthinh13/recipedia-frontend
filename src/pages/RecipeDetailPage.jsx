import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { dishTypeLabels, cookingTimeLabels } from "../lib/enumDisplayMap";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Check,
  Clock,
  ChefHat,
  Heart,
  Bookmark,
  MessageCircle,
  Microwave,
  BadgeInfo,
  Utensils,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const getDicebearAvatar = (seed) =>
  `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
    seed || "U"
  )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;
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

const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState("1X");
  const options = ["½X", "1X", "2X"];

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        console.log("Fetched recipe:", data);
        setRecipe(data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!recipe) return <div className="p-4">Recipe not found.</div>;

  // Ingredients (already an array of objects per schema)
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  // Instructions split into steps by newlines
  const instructionsArray = recipe.instructions
    ? recipe.instructions.split("\n").filter((line) => line.trim() !== "")
    : [];
  // helper to scale ingredient amounts
  const scaleAmount = (amount, multiplier) => {
    if (!amount) return "";

    let factor = 1;
    if (multiplier === "½X") factor = 0.5;
    if (multiplier === "1X") factor = 1;
    if (multiplier === "2X") factor = 2;

    // Handle both numbers and strings like "1.5"
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return amount; // fallback if amount is not a number (e.g., "pinch")

    // Round to avoid weird decimals
    return (numericAmount * factor).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-2xl mt-2 p-4">
        <Link to={"/"}>
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">Back to Recipes</div>
          </Button>
        </Link>

        <Card className="mt-2 overflow-hidden">
          {/* Cover image */}{" "}
          {recipe.coverImage && (
            <div className="flex h-56 w-full overflow-hidden">
              <img
                src={recipe.coverImage}
                alt={recipe.title}
                className="w-full object-cover"
              />
            </div>
          )}
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-row justify-between items-start">
              {/* Left block */}
              <div className="flex-col w-auto space-y-2 justify-start">
                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-[var(--card-foreground)] antialiased">
                    {recipe.title}
                  </h2>
                </div>

                {/* Dish type + Cooking time */}
                <div className="flex justify-start items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-gray-400 " />
                    <span className="text-base text-gray-600 antialiased">
                      {dishTypeLabels[recipe.dishType] ?? recipe.dishType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400 " />
                    <span className="text-base  text-gray-600 antialiased">
                      {cookingTimeLabels[recipe.cookingTime] ??
                        recipe.cookingTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gray-400 " />
                    <span className="text-base text-gray-600 antialiased">
                      {recipe.likes.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-400 " />
                    <span className="text-base text-gray-600 antialiased">
                      {recipe.comments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bookmark button on the right */}

              <Button size="icon" variant="ghost" className="cursor-pointer">
                <Bookmark className="" />
              </Button>
            </div>
            {/* Author + Date */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={
                      recipe.author?.avatarUrl ||
                      getDicebearAvatar(
                        recipe.author?.username || recipe.author?.name || "U"
                      )
                    }
                    alt={
                      recipe.author?.username || recipe.author?.name || "User"
                    }
                  />
                  <AvatarFallback>
                    {recipe.author?.username?.[0]?.toUpperCase() ||
                      recipe.author?.name?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div className="cursor-pointer hover:text-[var(--color-primary)] text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
                    {recipe.author?.name || "Mysterious Chef"}
                  </div>
                  <div className="text-xs flex text-gray-400 font-light">
                    {formatPostedDate(recipe.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            {/* Ingredients */}
            <div className="space-y-2">
              {/* Title */}
              <div className="flex justify-start items-center gap-2">
                <h2 className="text-2xl font-bold text-[var(--card-foreground)] antialiased">
                  Ingredients
                </h2>
                <Utensils className="text-accent" />
              </div>
              {/* Switch Buttons */}
              <div className="flex w-fit flex-row gap-0 overflow-hidden rounded-none border-2 border-[var(--accent)]">
                {options.map((value) => (
                  <Button
                    key={value}
                    variant="ghost"
                    onClick={() => setSelected(value)}
                    className={`cursor-pointer rounded-none 
                    ${selected === value ? "bg-[var(--accent)]" : ""}`}
                  >
                    {/* Only show check on the selected button */}
                    {selected === value && <Check className="h-4 w-4" />}
                    {value}
                  </Button>
                ))}
              </div>
              <div className="text-sm flex text-[var(--muted-foreground)] font-light items-center gap-1">
                {" "}
                <BadgeInfo className="h-4 w-4" />
                Original recipe (1X) yields 4 servings
              </div>
              {/* Ingredients Table */}
              <div className="flex rounded-none border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {" "}
                      <TableHead className="text-base ">Ingredient</TableHead>
                      <TableHead className="w-24 text-right text-base ">
                        {" "}
                        Amount
                      </TableHead>
                      <TableHead className="w-24 text-center text-base ">
                        Unit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-foreground  text-base ">
                          {ingredient.name}
                        </TableCell>

                        <TableCell className="text-muted-foreground text-right text-base ">
                          {scaleAmount(ingredient.amount, selected)}
                        </TableCell>

                        <TableCell className="text-muted-foreground text-center text-base ">
                          {ingredient.measurement}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {/* Title */}
              <div className="flex justify-start items-center gap-2">
                <h2 className="text-2xl font-bold text-[var(--card-foreground)] antialiased">
                  Cooking Instructions
                </h2>
                <Microwave className="text-accent" />
              </div>

              <div className="whitespace-pre-line text-muted-foreground flex rounded-none border mt-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-base leading-loose">
                        {" "}
                        {recipe.instructions}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
