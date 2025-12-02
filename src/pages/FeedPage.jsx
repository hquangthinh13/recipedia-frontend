import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecipeCard from '@/components/recipe-card';
import RecipeCardHorizontal from '@/components/recipe-card-horizontal';
import { Button } from '@/components/ui/button';
import EditRecipeForm from '@/components/edit-recipe-form';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
const FeedPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [cookingTime, setCookingTime] = useState('');
  const [dishType, setDishType] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); //Loading recipes
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null); // sentinel for infinite scroll
  const PAGE_SIZE = 9;
  const qParam = searchParams.get('q') || '';

  const [editOpen, setEditOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const { user: authUser } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Close dialog whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  const fetchRecipes = async ({ append = false } = {}) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      const qs = new URLSearchParams();

      if (qParam) qs.set('q', qParam);

      if (cookingTime) qs.set('cookingTime', cookingTime);
      if (dishType) qs.set('dishType', dishType);
      if (sort) qs.set('sort', sort);

      // Update browser URL so it's shareable/bookmarkable
      navigate({ pathname: '/recipes', search: `?${qs.toString()}` }, { replace: true });

      // Add pagination params for the API call only
      qs.set('limit', String(PAGE_SIZE));
      qs.set('page', String(page));

      // Hit the API with the same query string
      const res = await api.get(`/recipes?${qs.toString()}`);
      const batch = res.data || [];

      setHasMore(batch.length === PAGE_SIZE);

      if (append) {
        setRecipes((prev) => [...prev, ...batch]);
        console.log('Appending recipes:', batch);
      } else {
        setRecipes(batch);
        console.log('Fetched recipes:', batch);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const resetFilters = () => {
    // reset state only
    setCookingTime('');
    setDishType('');
    setSort('');
    setPage(1);
    setHasMore(true);
    setRecipes([]);
  };

  useEffect(() => {
    document.title = 'Recipedia | Feeds';
    // On first load, hydrate filters from URL (if present)
    // This runs only once; subsequent changes come from user actions.
    const initialCooking = searchParams.get('cookingTime') || '';
    const initialDish = searchParams.get('dishType') || '';
    const initialSort = searchParams.get('sort') || '';
    if (initialCooking) setCookingTime(initialCooking);
    if (initialDish) setDishType(initialDish);
    if (initialSort) setSort(initialSort);
  }, []);
  // 2) Recipes whenever filters/page change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchRecipes({ append: false });
  }, [qParam, cookingTime, dishType, sort]);
  useEffect(() => {
    if (page > 1) fetchRecipes({ append: true });
  }, [page]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    // Only start observing after the first batch is loaded
    if (isLoading) return;
    if (!loadMoreRef.current) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && hasMore) {
          setPage((p) => p + 1);
        }
      },
      {
        root: null, // viewport (default)
        rootMargin: '0px', // you can use '200px' if you want earlier prefetch
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, hasMore]);
  return (
    <div className="min-h-screen">
      <div className="px-0 pt-0 max-w-6xl mx-auto">
        <Tabs
          value={dishType || 'all'}
          onValueChange={(val) => {
            setPage(1);
            setHasMore(true);
            setRecipes([]);
            setDishType(val === 'all' ? '' : val);
          }}
          defaultValue="all"
          className="container w-full mx-auto max-w-6xl gap-2 p-4 mt-0 justify-center"
        >
          <h2 className="scroll-mt-24 flex flex-1 text-2xl font-bold mb-4 text-card-foreground items-center gap-1">
            <p className="relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
              Explore Recipes
            </p>
          </h2>
          <div className="flex flex-col md:flex-row flex-wrap justify-between gap-2 flex-1 mb-6">
            <TabsList className="flex h-fit flex-wrap justify-center md:justify-start gap-2">
              <TabsTrigger value="all" className="cursor-pointer">
                All
              </TabsTrigger>
              <TabsTrigger value="starter" className="cursor-pointer">
                Starter
              </TabsTrigger>
              <TabsTrigger value="main" className="cursor-pointer">
                Main
              </TabsTrigger>
              <TabsTrigger value="side" className="cursor-pointer">
                Side
              </TabsTrigger>
              <TabsTrigger value="dessert" className="cursor-pointer">
                Dessert
              </TabsTrigger>
              <TabsTrigger value="drink" className="cursor-pointer">
                Drink
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-row justify-between items-center w-full sm:w-auto">
              <div className="flex flex-1 flex-row gap-2 items-center">
                <a className="flex text-xs uppercase text-muted-foreground whitespace-nowrap">
                  Time
                </a>
                <Select
                  value={cookingTime || 'all'}
                  onValueChange={(val) => {
                    setPage(1);
                    setHasMore(true);
                    setRecipes([]);
                    setCookingTime(val === 'all' ? '' : val);
                  }}
                >
                  <SelectTrigger className="flex flex-1 md:w-[150px] cursor-pointer ">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all" className="cursor-pointer">
                        All
                      </SelectItem>
                      <SelectItem value="quick" className="cursor-pointer">
                        {'<'} 30 minutes
                      </SelectItem>
                      <SelectItem value="medium" className="cursor-pointer">
                        30–60 minutes
                      </SelectItem>
                      <SelectItem value="long" className="cursor-pointer">
                        1-2 hours
                      </SelectItem>
                      <SelectItem value="veryLong" className="cursor-pointer">
                        {'>'} 2 hours
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-4 flex flex-1 flex-row gap-2 items-center">
                <a className="flex text-xs uppercase text-muted-foreground whitespace-nowrap">
                  Sort by
                </a>
                <Select
                  value={sort || 'newest'}
                  onValueChange={(val) => {
                    setPage(1);
                    setHasMore(true);
                    setRecipes([]);
                    setSort(val);
                  }}
                >
                  <SelectTrigger className="flex-1 md:w-[150px] cursor-pointer ">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="liked" className="cursor-pointer">
                        Most Liked
                      </SelectItem>
                      <SelectItem value="newest" className="cursor-pointer">
                        Newest
                      </SelectItem>
                      <SelectItem value="oldest" className="cursor-pointer">
                        Oldest
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="ml-4 cursor-pointer"
                onClick={resetFilters}
              >
                <RotateCcw />
              </Button>
            </div>
          </div>
          {recipes.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-sm text-center">
              No recipes found matching the selected filters.
            </p>
          )}
          {isLoading && page === 1 ? (
            <div className="w-full h-32 flex items-center justify-center">
              <Spinner />
            </div>
          ) : null}
          {recipes.length > 0 && (
            <div className="max-w-6xl mx-auto w-auto columns-1 md:columns-2 lg:columns-3">
              {recipes.map((recipe) => {
                const canEdit =
                  authUser &&
                  (authUser._id === recipe.author?._id || authUser.id === recipe.author?._id);
                return (
                  <div key={recipe._id} className="mb-4">
                    <RecipeCardHorizontal
                      //   key={recipe._id}
                      recipe={recipe}
                      className="break-inside-avoid-column"
                      isOwner={!!canEdit}
                      onEdit={(recipe) => {
                        setEditingRecipe(recipe);
                        setEditOpen(true);
                      }}
                      onDelete={(id) => {
                        setRecipes((prev) => prev.filter((rec) => rec._id !== id));
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {isLoadingMore && (
            <div className="w-full h-32 flex items-center justify-center">
              <Spinner />
            </div>
          )}

          <div ref={loadMoreRef} className="h-3" />
        </Tabs>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            aria-describedby="edit-recipe-desc"
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Edit Recipe</DialogTitle>{' '}
              <DialogDescription id="edit-recipe-desc"></DialogDescription>
            </DialogHeader>
            {editingRecipe && (
              <EditRecipeForm
                recipe={editingRecipe}
                onClose={() => setEditOpen(false)}
                onUpdated={(updated) => {
                  setRecipes((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
                  setEditOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FeedPage;
