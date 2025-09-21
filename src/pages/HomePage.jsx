import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import LoginCard from "../components/login-card";
import Navbar from "../components/navbar";
import { useState } from "react";
import axios from "axios";
import RecipeCard from "../components/recipe-card";
import LogoutButton from "../components/log-out-button";
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

  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [showLogin, setShowLogin] = useState(false); // control login popup
  const [user, setUser] = useState(null);

  const handleLogin = async (values) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/login",
        values,
        { withCredentials: true }
      );
      if (data.success) {
        setUser(data.user);
        navigate("/"); // or close modal if using dialog
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  useEffect(() => {
    const verifyAndFetch = async () => {
      // Verify cookie// Fetch recipes
      try {
        const res = await axios.get("http://localhost:5001/api/recipes");
        console.log(res.data);
        setRecipes(res.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
      if (!cookies.token) {
        setShowLogin(true); // show login popup instead of navigate
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(
          "http://localhost:5001/api/auth/",
          {},
          { withCredentials: true }
        );
        setUsername(data.name);
        setShowLogin(false);
      } catch (err) {
        console.error("Error verifying user:", err);
        setShowLogin(true);
        return;
      } finally {
        setLoading(false);
      }
    };
    verifyAndFetch();
  }, [cookies]);

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
      <LogoutButton />
      <Tabs
        defaultValue="all"
        className="container w-full mx-auto max-w-7xl p-4 mt-2 justify-center"
      >
        <div className="hidden md:flex lg:flex justify-center gap-6 flex-1 mb-4">
          <Select>
            <SelectTrigger className="w-[150px] cursor-pointer bg-white">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time</SelectLabel>
                <SelectItem value="quick" className="cursor-pointer">
                  {"<"} 30 minutes
                </SelectItem>
                <SelectItem value="medium" className="cursor-pointer">
                  30–60 minutes
                </SelectItem>
                <SelectItem value="long" className="cursor-pointer">
                  1-2 hours
                </SelectItem>
                <SelectItem value="very-long" className="cursor-pointer">
                  {">"} 2 hours
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <TabsList className="flex justify-center gap-2">
            <TabsTrigger value="all" className="cursor-pointer">
              All
            </TabsTrigger>
            <TabsTrigger value="saved" className="cursor-pointer">
              Saved
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

          <Select>
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
