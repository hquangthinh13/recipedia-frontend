import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { dishTypeLabels, cookingTimeLabels } from '@/lib/enumDisplayMap';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Navbar from '@/components/navbar';
import RecipeCardSmall from '@/components/recipe-card-small';
import RecipeCardRemix from '@/components/recipe-card-remix';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { Spinner, SmallSpinner } from '@/components/spinner';

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
  FileDown,
  SquareCheckBig,
  Repeat,
  CircleStar,
  NotebookPen,
  Wheat,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import UserComment from '@/components/user-comment';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatDate';
import { exportCardToPng, exportCardToPdf, exportIngredientsPdf } from '@/lib/recipeExport';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;

const RecipeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [parentRecipe, setParentRecipe] = useState(null);
  const [childRecipes, setChildRecipes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingChild, setLoadingChild] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingIngredient, setExportingIngredient] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const { user, setUser } = useAuth();
  const [comments, setComments] = useState([]);
  const location = useLocation(); // to read state from navigation
  const commentInputRef = useRef(null); // ref for textarea
  const [selected, setSelected] = useState('1X');
  const options = ['¼X', '½X', '1X', '2X', '3X'];
  const avatarUrl = recipe?.author?.avatar || FallBackAvatar;
  const authorName = recipe?.author?.name || 'Mysterious Chef';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [favorite, setFavorite] = useState(false);
  const cardRef = useRef(null);
  const isRemix = recipe?.parentRecipe;

  // Comments pagination
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3); // page size
  const [totalPages, setTotalPages] = useState(1);

  // Child recipes pagination
  const [childPage, setChildPage] = useState(1);
  const [childLimit, setChildLimit] = useState(3); // child recipes per page
  const [childTotalPages, setChildTotalPages] = useState(1);

  // Helper to compute which page numbers to show (with ellipses)

  const getPageNumbers = (current, max) => {
    const delta = 1; // how many neighbors to show around current

    if (!max || max <= 1) return [1];
    if (max <= 7) return Array.from({ length: max }, (_, i) => i + 1);

    const pages = [1];
    const left = Math.max(2, current - delta);
    const right = Math.min(max - 1, current + delta);

    if (left > 2) pages.push('ellipsis-left');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < max - 1) pages.push('ellipsis-right');
    pages.push(max);

    return pages;
  };

  const handleCommentDeleted = async (deletedId) => {
    // reload current page; if it becomes empty and not first page, go to previous
    await fetchComments(page);
    if (comments.length === 1 && page > 1) {
      await fetchComments(page - 1);
    }
  };
  const handleRemixClick = () => {
    if (!user) {
      toast.error('Please log in to remix this recipe');
      return;
    }

    // navigate(`/recipes/${id}/remix`);
    navigate(`/remix/${id}`);
  };

  // Fetch *paginated* comments (call this after the recipe loads)
  const fetchComments = async (pageToFetch = 1) => {
    try {
      setCommentsLoading(true);
      const res = await api.get(`/recipes/${id}/comments`, {
        params: { page: pageToFetch, limit },
      });
      console.log('Comments: ', res);
      const list = res.data?.comments || res.data?.data || []; // flexible field name
      // prefer server totals; fallback to recipe.comments length if needed
      const totalCount =
        typeof res.data?.totalCount === 'number'
          ? res.data.totalCount
          : typeof res.data?.total === 'number'
            ? res.data.total
            : Array.isArray(recipe?.comments)
              ? recipe.comments.length
              : list.length;

      const serverTotalPages =
        typeof res.data?.totalPages === 'number'
          ? res.data.totalPages
          : Math.max(1, Math.ceil(totalCount / limit));

      setComments(list);
      setTotalPages(serverTotalPages);
      setPage(pageToFetch);
    } catch (e) {
      console.error('Failed to fetch comments:', e);
    } finally {
      setCommentsLoading(false);
    }
  };
  // After your recipe is fetched, load page 1 of comments
  useEffect(() => {
    if (recipe?._id) {
      fetchComments(1);
    }
  }, [recipe?._id, limit]);

  const handleExport = async () => {
    if (!cardRef.current) return;

    try {
      setExporting(true);
      await exportCardToPng(cardRef.current, `Recipedia - ${recipe.title || 'recipe'}.png`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;

    try {
      setExportingPDF(true);
      await exportCardToPdf(cardRef.current, `Recipedia - ${recipe.title || 'recipe'}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportIngredients = async () => {
    setExportingIngredient(true);

    await exportIngredientsPdf({
      title: recipe.title,
      author: recipe.author?.name || 'Unknown author',
      ingredients: recipe.ingredients,
    });

    setExportingIngredient(false);
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

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      setCommenting(true);
      const res = await api.post(
        `/recipes/${recipe._id}/comments`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      setCommenting(false);

      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
      setIsCommentFocused(false);
      toast.success('Comment posted!');
    } catch (error) {
      setCommenting(false);

      console.error('Error posting comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleCommentCancel = () => {
    setNewComment('');
    setIsCommentFocused(false);
  };
  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/recipes/${id}`);
      console.log('Fetched recipe:', data);
      setRecipe(data);
      setParentRecipe(data.parentRecipe);
      setComments(data.comments || []);
      document.title = `Recipedia | ${data.title}`;
    } catch (err) {
      console.error('Error fetching recipe:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchChildRecipes = async (pageToFetch = 1) => {
    try {
      setLoadingChild(true);
      const { data } = await api.get(`/recipes/${id}/remixes`, {
        params: { page: pageToFetch, limit: childLimit },
      });
      console.log('Fetched child recipe:', data);

      const list = data.recipes || [];
      const totalCount = typeof data.total === 'number' ? data.total : list.length;

      const serverTotalPages =
        typeof data.totalPages === 'number'
          ? data.totalPages
          : Math.max(1, Math.ceil(totalCount / childLimit));

      setChildRecipes(list);
      setChildTotalPages(serverTotalPages);
      setChildPage(pageToFetch);
    } catch (err) {
      console.error('Error fetching child recipe:', err);
    } finally {
      setLoadingChild(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
    fetchChildRecipes(1);
  }, [id, childLimit]);

  // Keep favorite state in sync when user or recipe changes
  useEffect(() => {
    if (user?.favorites && recipe?._id) {
      const isFav = user.favorites.some((id) => id === recipe._id || id._id === recipe._id);
      setFavorite(isFav);
    }
  }, [user, recipe]);
  useEffect(() => {
    if (location.state?.scrollToComment && commentInputRef.current) {
      // Smooth scroll and focus
      setTimeout(() => {
        commentInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
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
  if (!recipe)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia>
              <Link to={'/'} className="flex flex-1">
                <img src={logo} alt="Recipedia Logo" className="h-12" />
              </Link>
            </EmptyMedia>
            <EmptyTitle>Recipe not found</EmptyTitle>
            <EmptyDescription>The requested recipe doesn’t exist.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </EmptyContent>
        </Empty>{' '}
      </div>
    );

  // Ingredients (already an array of objects per schema)
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  // helper to scale ingredient amounts
  const scaleAmount = (amount, multiplier) => {
    if (!amount) return '';

    let factor = 1;
    if (multiplier === '¼X') factor = 0.25;
    if (multiplier === '½X') factor = 0.5;
    if (multiplier === '1X') factor = 1;
    if (multiplier === '2X') factor = 2;
    if (multiplier === '3X') factor = 3;

    // Handle both numbers and strings
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return amount; // fallback if amount is not a number (e.g., "pinch")

    // Round to avoid weird decimals
    return (numericAmount * factor).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar needTimer={true} />
      <div className="mx-auto max-w-6xl mt-2 mb-24 p-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <Link to={'/'}>
            <Button variant="ghost" className="cursor-pointer">
              <ArrowLeft />
              <div className="hidden md:flex lg:flex">Home</div>
            </Button>
          </Link>

          <div className="flex flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex">
                  {/* Desktop button */}
                  <Button
                    disabled={exporting || exportingPDF}
                    variant="outline"
                    className="cursor-pointer hidden md:flex"
                  >
                    <FileDown /> Export Recipe
                  </Button>

                  {/* Mobile button */}
                  <Button
                    disabled={exporting || exportingPDF}
                    variant="outline"
                    size="icon"
                    className="cursor-pointer flex md:hidden"
                  >
                    <FileDown />
                  </Button>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Export Shopping List */}
            <Button
              disabled={exportingIngredient}
              variant="outline"
              onClick={handleExportIngredients}
              className="cursor-pointer hidden md:flex"
            >
              <SquareCheckBig />
              Export Shopping List
            </Button>

            <Button
              disabled={exportingIngredient}
              variant="outline"
              size="icon"
              onClick={handleExportIngredients}
              className="cursor-pointer flex md:hidden"
            >
              <SquareCheckBig />
            </Button>

            {/* Remix */}

            <Button
              variant="default"
              onClick={handleRemixClick}
              className="hidden md:flex cursor-pointer"
            >
              <Repeat />
              Remix
            </Button>

            <Button
              variant="default"
              onClick={handleRemixClick}
              size="icon"
              className="flex md:hidden cursor-pointer"
            >
              <Repeat />
            </Button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <Card ref={cardRef} className="flex-1 mt-0 overflow-hidden h-fit">
            {/* Cover image */}
            {recipe.coverImage && (
              <div className="flex aspect-video w-full overflow-hidden">
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full object-cover ease-in-out duration-300 hover:brightness-90 hover:scale-105"
                />
              </div>
            )}
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-row mb-2 justify-between items-center">
                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-card-foreground antialiased">
                    {recipe.title}
                  </h2>
                </div>

                {/* Bookmark button on the right */}
                <Button
                  onClick={handleFavorite}
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                >
                  <Bookmark
                    className={`transition ${favorite && 'fill-primary text-primary'}`}
                  />{' '}
                </Button>
              </div>
              {/* Dish type + Cooking time */}
              <div className="md:flex md:flex-1 md:flex-row grid grid-cols-2 justify-start items-start md:items-center gap-6 lg:gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-gray-400 " />
                  <span className="text-base text-gray-600 antialiased">
                    {dishTypeLabels[recipe.dishType] ?? recipe.dishType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 " />
                  <span className="text-base  text-gray-600 antialiased">
                    {cookingTimeLabels[recipe.cookingTime] ?? recipe.cookingTime}
                  </span>
                </div>

                <div className="flex  items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400 " />
                  <span className="text-base text-gray-600 antialiased">{recipe.likes.length}</span>
                </div>

                <div className="flex  items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-400 " />
                  <span className="text-base text-gray-600 antialiased">
                    {recipe.comments.length}
                  </span>
                </div>
                <div className="flex   items-center gap-2">
                  <CircleStar className="h-4 w-4 text-gray-400 " />
                  <span className="text-base text-gray-600 antialiased">
                    {isRemix ? 'Remixed' : 'Original'}
                  </span>
                </div>

                <div className="flex  items-center gap-2">
                  <Repeat className="h-4 w-4 text-gray-400 " />
                  <span className="text-base text-gray-600 antialiased">{recipe.remixCount}</span>
                </div>
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
                      <div className="cursor-pointer hover:text-accent text-sm flex line-clamp-1 font-medium text-card-foreground">
                        {recipe.author?.name || 'Mysterious Chef'}
                      </div>
                    </Link>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs flex text-gray-400 font-light">
                          {formatDate(recipe.createdAt)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{new Date(recipe.createdAt).toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              {/* Ingredients */}
              <div className="space-y-2">
                {/* Title */}
                <div className="flex justify-start items-center gap-2">
                  <h2 className="text-2xl font-bold text-card-foreground antialiased">
                    Ingredients
                  </h2>
                  <Wheat className="text-accent" />
                </div>
                {/* Switch Buttons */}
                <div className="flex w-fit flex-row overflow-hidden rounded-none border-2 border-accent">
                  {options.map((value) => (
                    <Button
                      key={value}
                      variant="ghost"
                      onClick={() => setSelected(value)}
                      className={`cursor-pointer rounded-none flex
                    ${selected === value ? 'bg-accent' : ''}`}
                    >
                      {/* Only show check on the selected button */}
                      {selected === value && <Check className="h-4 w-4" />}
                      {value}
                    </Button>
                  ))}
                </div>
                <div className="text-sm flex text-muted-foreground font-light items-center gap-1">
                  <BadgeInfo className="h-4 w-4" />
                  Original recipe (1X) yields 4 servings. Adjust serving size to update ingredient
                  amounts.
                </div>
                {/* Ingredients Table */}
                <div className="flex rounded-none border mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base ">Ingredient</TableHead>
                        <TableHead className="w-24 text-right text-base ">Amount</TableHead>
                        <TableHead className="w-24 text-center text-base ">Unit</TableHead>
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
                  <h2 className="text-2xl font-bold text-card-foreground antialiased">
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
          <div className="flex flex-col gap-4">
            {isRemix && (
              <>
                {' '}
                {recipe.remixNote && (
                  <Card className="lg:w-sm mt-0 h-fit">
                    <CardContent className="space-y-6 p-6">
                      {/* Comments Section */}
                      <div className="space-y-2">
                        {/* Title */}
                        <div className="flex justify-start items-center gap-2">
                          <h2 className="text-2xl font-bold text-card-foreground antialiased">
                            Remix Note
                          </h2>
                          <NotebookPen className="text-accent" />
                        </div>

                        <div>
                          <p className="text-muted-foreground">{recipe.remixNote}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="lg:w-sm">
                  <RecipeCardRemix isTrending={false} recipe={parentRecipe} />{' '}
                </div>
              </>
            )}
            <Card className="lg:w-sm mt-0 h-fit">
              <CardContent className="space-y-6 p-6">
                {/* Comments Section */}
                <div className="space-y-2">
                  {/* Title */}
                  <div className="flex justify-start items-center gap-2">
                    <h2 className="text-2xl font-bold text-card-foreground antialiased">
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
                              user?.name || 'U',
                            )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`
                          }
                          alt={user?.name || 'Your avatar'}
                        />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <Textarea
                          ref={commentInputRef}
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onFocus={() => setIsCommentFocused(true)}
                          className={`resize-none border-0 border-b-2 rounded-none focus:border-none transition-all duration-200 ${
                            isCommentFocused ? 'min-h-[80px]' : 'min-h-[40px]'
                          }`}
                          rows={isCommentFocused ? 3 : 1}
                        />
                        {isCommentFocused && (
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="ghost"
                              onClick={handleCommentCancel}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {' '}
                              <X />
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCommentSubmit}
                              disabled={!newComment.trim() || commenting}
                              className="cursor-pointer"
                            >
                              <MessageSquarePlus />
                              {commenting ? 'Commenting...' : 'Comment'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Comments Section */}
                <Separator className="my-2" />
                {/* Comment List */}

                <div className="mt-6">
                  {commentsLoading ? (
                    <div className="flex justify-center items-center h-76">
                      <SmallSpinner />{' '}
                    </div>
                  ) : comments.length > 0 ? (
                    <>
                      {comments.map((comment) => (
                        <UserComment
                          key={comment._id}
                          comment={comment}
                          recipeId={recipe._id}
                          onDelete={handleCommentDeleted}
                        />
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent className="flex-wrap">
                              {/* {getPageNumbers().map((p, idx) => { */}
                              {getPageNumbers(page, totalPages).map((p, idx) => {
                                if (p === 'ellipsis-left' || p === 'ellipsis-right') {
                                  return (
                                    <PaginationItem key={`${p}-${idx}`}>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                                return (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      href="#"
                                      isActive={p === page}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (p !== page) fetchComments(p);
                                      }}
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:w-sm mt-0 h-fit">
              <CardContent className="space-y-6 p-6">
                {/* Comments Section */}
                <div className="space-y-2">
                  {/* Title */}
                  <div className="flex justify-start items-center gap-2">
                    <h2 className="text-2xl font-bold text-card-foreground antialiased">
                      Child Recipes
                    </h2>
                    <Utensils className="text-accent" />
                  </div>
                </div>{' '}
                <Separator className="mt-2 mb-0 z-100" />
                {/* Recipes List */}
                <div className="">
                  {loadingChild ? (
                    <div className="flex justify-center items-center h-76">
                      <SmallSpinner />{' '}
                    </div>
                  ) : childRecipes.length > 0 ? (
                    <>
                      {childRecipes.map((child) => (
                        <RecipeCardSmall key={child._id} recipe={child} isChild={true} />
                      ))}
                      {/* Pagination */}
                      {childTotalPages > 1 && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent className="flex-wrap">
                              {getPageNumbers(childPage, childTotalPages).map((p, idx) => {
                                if (p === 'ellipsis-left' || p === 'ellipsis-right') {
                                  return (
                                    <PaginationItem key={`${p}-${idx}`}>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                                return (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      href="#"
                                      isActive={p === childPage}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (p !== childPage) fetchChildRecipes(p);
                                      }}
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-6">
                      No recipes remixed yet. Be the first to remix this recipe!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* {childRecipes.length > 0 && (
              <div className="hidden lg:grid lg:w-sm space-y-4 grid-cols-1">
                {childRecipes.map((child) => (
                  <RecipeCardSmall recipe={child} isChild={true} />
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
