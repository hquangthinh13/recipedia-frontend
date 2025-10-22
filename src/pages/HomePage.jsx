import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { toast } from "sonner";
import pattern from "../assets/images/Recipedia_Pattern.svg";
import background from "../assets/images/Background.jpg";
import LoginCard from "../components/login-card";
import Navbar from "../components/navbar";
import { useState } from "react";
import RecipeCard from "../components/recipe-card";
import { Button } from "@/components/ui/button";

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
  // const [showLogin, setShowLogin] = useState(false); // control login popup
  const { login } = useAuth();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null); // sentinel for infinite scroll
  const PAGE_SIZE = 3;
  const formRef = useRef(null);

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

  const onClose = () => {
    // setShowLogin(false);
  };

  const handleLogin = async (values) => {
    try {
      const { data } = await api.post("/auth/login", values);
      if (data.token) {
        await login(data.token);
        navigate("/");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.msg || "Unable to log in. Please try again.";

      // ✅ Use formRef.current to set errors
      if (!formRef.current) return;

      if (msg.toLowerCase().includes("not found")) {
        formRef.current.setError("email", {
          message: "No account found with this email.",
        });
      } else if (
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("password")
      ) {
        formRef.current.setError("password", {
          message: "Incorrect password.",
        });
      } else if (msg.toLowerCase().includes("verify")) {
        formRef.current.setError("email", {
          message: "Please verify your email first.",
        });
      } else {
        formRef.current.setError("root", { message: msg });
      }
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
      // setShowLogin(true);
      setLoading(false);
      return;
    }
    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setUsername(data.name || "");
        // setShowLogin(false);
      })
      .catch((err) => {
        console.error("Error verifying user:", err);
        // setShowLogin(true);
      })
      .finally(() => setLoading(false));
  }, [cookingTime, dishType, sort, page]); // 👈 refetch when filters change

  // Reset paging when filters change (but not when page changes)
  useEffect(() => {
    setPage(1);
    setHasMore(true);
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

  return (
    <div className="min-h-screen">
      {/* {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
          <div className="relative z-10">
            <LoginCard ref={formRef} onSubmit={handleLogin} />
          </div>
        </div>
      )} */}
      <Navbar />

      <div className="relative flex w-full bg-primary px-4 py-16 items-center text-center">
        <div className="absolute inset-0">
          <img
            src={background}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative container mx-auto max-w-2xl z-10">
          <h1 className="text-4xl font-bold text-white">
            Welcome to Recipedia
          </h1>
          <p className="mt-2 text-lg text-white">
            Discover and share amazing recipes!
          </p>
        </div>
      </div>

      <div className="hidden lg:flex max-w-6xl px-4 py-2 items-center justify-center mx-auto mt-4">
        <img src={pattern} alt="Pattern" />
      </div>

      <Tabs
        onValueChange={(val) => {
          setDishType(val === "all" ? "" : val);
        }}
        defaultValue="all"
        className="container w-full mx-auto max-w-6xl p-4 mt-2 justify-center"
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
          <div className="grid max-w-6xl mx-auto w-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}

        <div className="flex justify-center my-8">
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
        <div ref={loadMoreRef} style={{ height: 1 }} />
      </Tabs>
    </div>
  );
};

export default HomePage;
