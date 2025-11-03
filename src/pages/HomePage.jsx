import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import Pattern from "@/components/pattern";
import Spinner from "@/components/spinner";
import { Flame } from "lucide-react";
import Navbar from "@/components/navbar";
import { useState } from "react";
import RecipeCard from "@/components/recipe-card";
import UserCard from "@/components/user-card";
import HomeLinkCard from "@/components/home-link-card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/page-footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const HomePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [topWeeklyRecipes, setTopWeeklyRecipes] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
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
  const sectionRef = useRef(null);
  const PAGE_SIZE = 6;
  const scrollToSection = () => {
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const fetchTopWeeklyRecipes = async () => {
    try {
      const res = await api.get("/recipes/trending?n=12");
      console.log("Top trending recipes:", res.data);
      setTopWeeklyRecipes(res.data);
    } catch (error) {
      console.error("Error fetching top trending recipes:", error);
    }
  };
  const fetchTopUsers = async () => {
    try {
      const res = await api.get("/users/top?limit=6");
      console.log("Top users:", res.data.topUsers);
      setTopUsers(res.data.topUsers);
    } catch (error) {
      console.error("Error fetching top users.", error);
    }
  };
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
        console.log("Appending recipes:", batch);
      } else {
        setRecipes(batch);
        console.log("Fetched recipes:", batch);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    document.title = "Recipedia | Home";
    // On first load, hydrate filters from URL (if present)
    // This runs only once; subsequent changes come from user actions.
    const initialCooking = searchParams.get("cookingTime") || "";
    const initialDish = searchParams.get("dishType") || "";
    const initialSort = searchParams.get("sort") || "";
    if (initialCooking) setCookingTime(initialCooking);
    if (initialDish) setDishType(initialDish);
    if (initialSort) setSort(initialSort);
  }, []);

  useEffect(() => {
    fetchTopWeeklyRecipes();
    fetchRecipes({ append: page > 1 });
    fetchTopUsers();
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
              {username
                ? `Welcome to Recipedia, ${username}!`
                : "Welcome to Recipedia"}
            </h1>
            <p className="text-sm md:text-md text-white">
              Discover and share amazing recipes!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto my-2 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <HomeLinkCard
          onClick={scrollToSection}
          index={1}
          title="Discover New Recipes"
        />
        <Link to="/customize-avatar">
          <HomeLinkCard index={2} title="Dress Your Chef" />
        </Link>{" "}
        {/* <Link to="/analytics">
          <HomeLinkCard index={3} title="Chef's Hall of Fame" />
        </Link> */}
        <Link to="/analytics">
          <HomeLinkCard index={3} title="Check Your Cooking Stats" />
        </Link>
      </div>
      <Pattern />

      <div className="w-full max-w-6xl px-4 mx-auto mt-4">
        <Carousel
          className="relative w-full"
          plugins={[
            Autoplay({
              delay: 5000, // 5 seconds between slides
              stopOnInteraction: false,
              stopOnMouseEnter: true,
              stopOnFocusIn: true,
            }),
          ]}
          opts={{
            loop: false, // makes the carousel loop infinitely
          }}
        >
          {/* Header row */}
          <div className="flex justify-between">
            <h2 className="flex flex-1 text-2xl cursor-pointer font-bold mb-4 text-card-foreground items-center gap-1">
              <Flame className="text-primary fill-primary" />
              <Link className="relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                Trending This Week
              </Link>
            </h2>

            <div className="flex justify-end items-center mb-3 gap-2">
              <CarouselPrevious className="cursor-pointer relative left-auto right-auto top-auto translate-y-0 h-8 w-8" />
              <CarouselNext className="cursor-pointer relative left-auto right-auto top-auto translate-y-0 h-8 w-8" />
            </div>
          </div>

          <CarouselContent>
            {topWeeklyRecipes.map((recipe) => (
              <CarouselItem
                className="md:basis-1/2 lg:basis-1/3"
                key={recipe._id}
              >
                <RecipeCard isTrending={true} recipe={recipe} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <Pattern />

      <div className="w-full max-w-6xl px-4 mx-auto mt-4">
        <Carousel className="relative w-full">
          {/* Header row */}
          <div className="flex justify-between">
            <h2 className="flex flex-1 text-2xl cursor-pointer font-bold mb-4 text-card-foreground items-center gap-1">
              <Link className="relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                Chef's Hall of Fame
              </Link>
            </h2>

            <div className="flex justify-end items-center mb-3 gap-2">
              <CarouselPrevious className="cursor-pointer relative left-auto right-auto top-auto translate-y-0 h-8 w-8" />
              <CarouselNext className="cursor-pointer relative left-auto right-auto top-auto translate-y-0 h-8 w-8" />
            </div>
          </div>

          <CarouselContent>
            {topUsers.map((user) => (
              <CarouselItem
                className="md:basis-1/2 lg:basis-1/3"
                key={user._id}
              >
                <UserCard rank={user.rank} user={user} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <Pattern />

      <Tabs
        onValueChange={(val) => {
          setDishType(val === "all" ? "" : val);
        }}
        defaultValue="all"
        className="container w-full mx-auto max-w-6xl gap-2 p-4 mt-0 justify-center"
      >
        <h2
          ref={sectionRef}
          className="scroll-mt-24 flex flex-1 text-2xl cursor-pointer font-bold mb-4 text-card-foreground items-center gap-1"
        >
          <Link className="relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
            Explore Recipes
          </Link>
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
          <div className="flex flex-row justify-between gap-12 md:gap-8 w-full sm:w-auto">
            <div className="flex flex-1 flex-row gap-2 items-center">
              <a className="flex text-xs uppercase text-muted-foreground whitespace-nowrap">
                Time
              </a>
              <Select
                className=""
                onValueChange={(val) => {
                  setCookingTime(val === "all" ? "" : val);
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
            </div>
            <div className="flex flex-1 flex-row gap-2 items-center">
              <a className="flex text-xs uppercase text-muted-foreground whitespace-nowrap">
                Sort by
              </a>
              <Select
                onValueChange={(val) => {
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
