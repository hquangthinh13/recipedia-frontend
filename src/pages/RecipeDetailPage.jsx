import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import Footer from "../components/page-footer";
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
  MessageSquareText,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/navbar";
import UserComment from "../components/user-comment";
import Spinner from "../components/spinner";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { formatDate } from "../lib/formatDate";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const { user, setUser } = useAuth();
  const [comments, setComments] = useState([]);
  const location = useLocation(); // 👈 to read state from navigation
  const commentInputRef = useRef(null); // 👈 ref for textarea
  const [selected, setSelected] = useState("1X");
  const options = ["½X", "1X", "2X"];
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const authorName = recipe?.author?.name || "Mysterious Chef";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [favorite, setFavorite] = useState(false);

  const handleFavorite = async () => {
    if (!token) {
      toast.error("Please log in first.");
      return;
    }
    try {
      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      setFavorite(res.data.isFavorite);
      toast.success(res.data.message);

      // ✅ Update global user favorites so both pages sync
      setUser((prev) => {
        if (!prev) return prev;
        const updatedFavorites = res.data.isFavorite
          ? [...prev.favorites, recipe._id] // add
          : prev.favorites.filter((id) => id !== recipe._id); // remove
        return { ...prev, favorites: updatedFavorites };
      });
    } catch (error) {
      toast.error("Failed to update favorites");
      console.error(error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(
        `/recipes/${recipe._id}/comments`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setComments((prev) => [...prev, res.data.comment]);
      setNewComment("");
      setIsCommentFocused(false);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  const handleCommentCancel = () => {
    setNewComment("");
    setIsCommentFocused(false);
  };
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        console.log("Fetched recipe:", data);
        setRecipe(data);
        setRecipe(data);
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);
  // Keep favorite state in sync when user or recipe changes
  useEffect(() => {
    if (user?.favorites && recipe?._id) {
      const isFav = user.favorites.some(
        (id) => id === recipe._id || id._id === recipe._id
      );
      setFavorite(isFav);
    }
  }, [user, recipe]);
  useEffect(() => {
    if (location.state?.scrollToComment && commentInputRef.current) {
      // Smooth scroll and focus
      setTimeout(() => {
        commentInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        commentInputRef.current.focus();
      }, 300);
    }
  }, [location.state, recipe]);

  if (loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
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
      <div className="mx-auto max-w-6xl mt-2 p-4">
        <Link to={"/"}>
          <Button variant="ghost" className="mb-2 cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">Back to Recipes</div>
          </Button>
        </Link>
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="flex-1 mt-0 overflow-hidden h-fit">
            {/* Cover image */}
            {recipe.coverImage && (
              <div className="flex aspect-video w-full overflow-hidden">
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

                <Button
                  onClick={handleFavorite}
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                >
                  <Bookmark
                    className={`transition ${
                      favorite && "fill-primary text-primary"
                    }`}
                  />{" "}
                </Button>
              </div>
              {/* Author + Date */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${recipe.author?._id}`}>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={avatarUrl} alt={authorName} />
                      <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex flex-col">
                    <Link to={`/profile/${recipe.author?._id}`}>
                      <div className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-[var(--card-foreground)]">
                        {recipe.author?.name || "Mysterious Chef"}
                      </div>{" "}
                    </Link>
                    <div className="text-xs flex text-gray-400 font-light">
                      {formatDate(recipe.createdAt)}
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
                  <BadgeInfo className="h-4 w-4" />
                  Original recipe (1X) yields 4 servings. Adjust serving size to
                  update ingredient amounts.
                </div>
                {/* Ingredients Table */}
                <div className="flex rounded-none border mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base ">Ingredient</TableHead>
                        <TableHead className="w-24 text-right text-base ">
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
                          {recipe.instructions}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:w-sm mt-0 h-fit">
            <CardContent className="space-y-6 p-6">
              {/* Comments Section */}
              <div className="space-y-2">
                {/* Title */}
                <div className="flex justify-start items-center gap-2">
                  <h2 className="text-2xl font-bold text-[var(--card-foreground)] antialiased">
                    Discussions
                  </h2>
                  <MessageSquareText className="text-accent" />
                </div>
                {user && (
                  <div className="flex gap-3 mt-4">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
                            user?.name || "U"
                          )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`
                        }
                        alt={user?.name || "Your avatar"}
                      />
                      <AvatarFallback>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <Textarea
                        ref={commentInputRef}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={() => setIsCommentFocused(true)}
                        className={`resize-none border-0 border-b-2 rounded-none focus:border-none transition-all duration-200 ${
                          isCommentFocused ? "min-h-[80px]" : "min-h-[40px]"
                        }`}
                        rows={isCommentFocused ? 3 : 1}
                      />
                      {isCommentFocused && (
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="ghost"
                            // size="sm"
                            onClick={handleCommentCancel}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {" "}
                            <X />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCommentSubmit}
                            disabled={!newComment.trim()}
                            // size="sm"
                            // variant="default"
                            className="cursor-pointer"
                          >
                            {" "}
                            <MessageSquarePlus />
                            Comment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}

              {/* <Separator className="my-2" /> */}
              {/* Comment List */}
              <div className="mt-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <UserComment key={comment._id} comment={comment} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>{" "}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecipeDetailPage;
