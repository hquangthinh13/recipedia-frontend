import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { toast } from "sonner";

import LoginCard from "../components/login-card";
import Navbar from "../components/navbar";
import { useState } from "react";
import RecipeCard from "../components/recipe-card";
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
  const [showLogin, setShowLogin] = useState(false); // control login popup
  const { login } = useAuth();
  const fetchRecipes = async () => {
    try {
      const params = {};
      if (cookingTime) params.cookingTime = cookingTime;
      if (dishType) params.dishType = dishType;
      if (sort) params.sort = sort;

      const res = await api.get("/recipes", {
        params,
      });
      setRecipes(res.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleLogin = async (values) => {
    console.log("Content:", values);

    try {
      const { data } = await api.post("/auth/login", values);
      if (data.token) {
        login(data.token); // context will fetch user + update navbar
        setShowLogin(false);
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data);

      const msg =
        error.response?.data?.msg || "Unable to log in. Please try again.";
      toast("Login failed", {
        description: msg,
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchRecipes();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLogin(true);
      setLoading(false);
      return;
    }
    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setUsername(data.name || "");
        setShowLogin(false);
      })
      .catch((err) => {
        console.error("Error verifying user:", err);
        setShowLogin(true);
      })
      .finally(() => setLoading(false));
  }, [cookingTime, dishType, sort]); // 👈 refetch when filters change

  return (
    <div className="min-h-screen">
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dark semi-transparent background */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            // onClick={onClose} // Clicking outside closes modal
          />

          {/* Centered card */}
          <div className="relative z-10">
            <LoginCard onSubmit={handleLogin} />
          </div>
        </div>
      )}
      <Navbar />
      <Tabs
        onValueChange={(val) => {
          setDishType(val === "all" ? "" : val);
        }}
        defaultValue="all"
        className="container w-full mx-auto max-w-7xl p-4 mt-2 justify-center"
      >
        <div className="hidden md:flex lg:flex justify-center gap-6 flex-1 mb-4">
          <Select
            onValueChange={(val) => {
              setCookingTime(val === "all" ? "" : val);
            }}
          >
            <SelectTrigger className="w-[150px] cursor-pointer bg-white">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time</SelectLabel>
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

          <TabsList className="flex justify-center gap-2">
            <TabsTrigger value="all" className="cursor-pointer">
              All
            </TabsTrigger>
            {/* <TabsTrigger value="saved" className="cursor-pointer">
              Saved
            </TabsTrigger> */}
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
            <SelectTrigger className="w-[150px] cursor-pointer bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by</SelectLabel>
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
        {/* <div className="container mx-auto max-w-6xl p-4 mt-6"> */}

        {/* {loading && <div className="text-center text-primary py-10">Loading...</div>} */}
        {/* <div className="flex flex-1 justify-center"> */}
        {recipes.length > 0 && (
          <div className="grid mx-auto w-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
        {/* </div> */}
        {/* </div> */}
      </Tabs>
    </div>
  );
};

export default HomePage;
