import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import pattern from "../assets/images/Recipedia_Pattern.svg";
import Spinner from "../components/spinner";

import background from "../assets/images/Background.png";
import Navbar from "../components/navbar";
import { useState } from "react";
import RecipeCard from "../components/recipe-card";
import { Button } from "@/components/ui/button";
import CarouselBanner from "../components/carousel-banner";
import Footer from "../components/page-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [dishType, setDishType] = useState("");
  const [sort, setSort] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null); // sentinel for infinite scroll
  const PAGE_SIZE = 6;

  const fetchRecipes = async ({ append = false } = {}) => {
    try {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      const qs = new URLSearchParams();
      if (cookingTime) qs.set("cookingTime", cookingTime);
      if (dishType) qs.set("dishType", dishType);
      if (sort) qs.set("sort", sort);

      // Update browser URL so it's shareable/bookmarkable
      navigate(
        { pathname: "/", search: `?${qs.toString()}` },
        { replace: true }
      );

      // Add pagination params for the API call only
      qs.set("limit", String(PAGE_SIZE));
      qs.set("page", String(page));

      // Hit the API with the same query string
      const res = await api.get(`/recipes?${qs.toString()}`);
      const batch = res.data || [];

      setHasMore(batch.length === PAGE_SIZE);

      if (append) {
        setRecipes((prev) => [...prev, ...batch]);
      } else {
        setRecipes(batch);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // On first load, hydrate filters from URL (if present)
    // This runs only once; subsequent changes come from user actions.
    const initialCooking = searchParams.get("cookingTime") || "";
    const initialDish = searchParams.get("dishType") || "";
    const initialSort = searchParams.get("sort") || "";
    if (initialCooking) setCookingTime(initialCooking);
    if (initialDish) setDishType(initialDish);
    if (initialSort) setSort(initialSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRecipes({ append: page > 1 });

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setUsername(data.name || "");
      })
      .catch((err) => {
        console.error("Error verifying user:", err);
      })
      .finally(() => setLoading(false));
  }, [cookingTime, dishType, sort, page]); // refetch when filters change

  // Reset paging when filters change (but not when page changes)
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setRecipes([]);
  }, [cookingTime, dishType, sort]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && !isLoading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "0px" } // prefetch a bit early
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, hasMore]);
  if (loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="px-0 pt-0 max-w-6xl mx-auto">
        <div className="overflow-hidden relative flex w-auto h-fit px-4 items-center text-center">
          <div className="rounded-b-md relative container mx-auto p-4 max-w-6xl z-10 bg-primary">
            <h1 className="text-xl md:text-3xl font-bold text-white">
              Welcome to Recipedia
            </h1>
            <p className="text-sm md:text-md text-white">
              Discover and share amazing recipes!
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex max-w-6xl px-4 py-2 items-center justify-center mx-auto mt-0">
        <img src={pattern} alt="Pattern" />
      </div>
      <div className="px-4 max-w-6xl mt-2 mb-2 mx-auto">
        <CarouselBanner />
      </div>
      <Tabs
        onValueChange={(val) => {
          setDishType(val === "all" ? "" : val);
        }}
        defaultValue="all"
        className="container w-full mx-auto max-w-6xl p-4 mt-0 justify-center"
      >
        <div className="hidden md:flex lg:flex justify-between gap-6 flex-1 mb-6">
          <Select
            onValueChange={(val) => {
              setCookingTime(val === "all" ? "" : val);
            }}
          >
            <SelectTrigger className="w-[200px] cursor-pointer bg-white">
              <SelectValue placeholder="Cooking Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cooking Time</SelectLabel>
                <SelectItem value="all" className="cursor-pointer">
                  All
                </SelectItem>
                <SelectItem value="quick" className="cursor-pointer">
                  {"<"} 30 minutes
                </SelectItem>
                <SelectItem value="medium" className="cursor-pointer">
                  30–60 minutes
                </SelectItem>
                <SelectItem value="long" className="cursor-pointer">
                  1-2 hours
                </SelectItem>
                <SelectItem value="veryLong" className="cursor-pointer">
                  {">"} 2 hours
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <TabsList className="flex justify-center gap-6">
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

          <Select
            onValueChange={(val) => {
              setSort(val);
            }}
          >
            <SelectTrigger className="w-[200px] cursor-pointer bg-white">
              <SelectValue placeholder="Sort by: Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sorting</SelectLabel>
                <SelectItem value="default" className="cursor-pointer">
                  Sort by: Default
                </SelectItem>
                <SelectItem value="liked" className="cursor-pointer">
                  Sort by: Most Liked
                </SelectItem>
                <SelectItem value="newest" className="cursor-pointer">
                  Sort by: Newest
                </SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">
                  Sort by: Oldest
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {recipes.length > 0 && (
          <div className="grid max-w-6xl mx-auto w-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}

        {recipes.length > 0 && (
          <div className="flex justify-center my-4">
            {hasMore ? (
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoadingMore}
                className="w-full disabled:opacity-60"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground "></div>
            )}
          </div>
        )}

        <div ref={loadMoreRef} style={{ height: 1 }} />
      </Tabs>
      <Footer />
    </div>
  );
};

export default HomePage;
