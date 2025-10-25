import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/page-footer";
import RecipeCardHorizontal from "../components/recipe-card-horizontal";
import coverImage from "../assets/images/Background.png";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { getTotalLikes } from "../lib/getTotalLikes";
const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = authUser?._id === id || authUser?.id === id;
  const totalLikes = getTotalLikes(recipes);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/profile`);
        setProfile(res.data.user);
        setRecipes(res.data.recipes);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );

  const joinedDate = profile.createdAt
    ? format(new Date(profile.createdAt), "MMM d, yyyy")
    : "Unknown";
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Kitchen Section */}
      <div className="flex flex-col mx-auto max-w-6xl px-4 pb-4">
        <Card>
          {/* cover + avatar */}
          <div className="relative w-full flex flex-col items-center">
            {/* Cover Image */}
            <div className="w-full overflow-hidden  h-32 md:h-48">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Avatar — positioned inside the same group */}
            <div className=" absolute left-1/2 bottom-0 translate-y-1/2 transform -translate-x-1/2 rounded-full outline-white outline-4">
              <Avatar className="object-cover w-36 h-36 cursor-pointer hover:brightness-95 transition duration-300 ">
                <AvatarImage
                  src={profile.avatar || FallBackAvatar}
                  alt={profile.name}
                />
              </Avatar>
            </div>
          </div>
          <CardContent>
            {/* Content directly below the grouped block */}
            <div className="pt-20 text-center bg-white">
              <h2 className=" text-3xl font-bold text-[var(--card-foreground)] antialiased">
                {profile.name}
              </h2>
              <span className=" text-muted-foreground text-sm leading-2">
                Joined {joinedDate}
              </span>{" "}
              {/* Stats */}
              <div className="mt-2 flex-row flex w-full justify-center items-center gap-6">
                {/* Following */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent">
                    86
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">
                    following
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Followers */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent">
                    86
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">
                    followers
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />
                {/* Likes */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent">
                    {totalLikes}
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">
                    likes
                  </span>
                </div>
              </div>
              {/* Stats */}
              {/* Buttons */}
              {/* Owner vs Visitor Actions */}
              <div className="mt-4 flex flex-row gap-4 justify-center">
                {isOwner ? (
                  <Button className="cursor-pointer">Edit Profile</Button>
                ) : (
                  <Button className="cursor-pointer">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </Button>
                )}
              </div>
            </div>
            {/* Content directly below the grouped block */}{" "}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-row gap-4 w-full mx-auto justify-center">
          {/* <Card className="lg:w-sm h-fit">
            <CardContent className="space-y-6 p-6">
              <div className="flex justify-start items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--card-foreground)] antialiased">
                  Kitchen Friends
                </h2>
              </div>
            </CardContent>
          </Card> */}
          <div className="mt-2 flex w-lg flex-col gap-2">
            <div className="flex justify-start items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--card-foreground)] antialiased">
                Shared Recipes
              </h2>
            </div>

            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recipes.map((r) => (
                  <RecipeCardHorizontal
                    key={r._id}
                    recipe={r}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center">
                {isOwner
                  ? "You haven't shared any recipes yet."
                  : "This chef hasn’t shared any recipes yet."}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Kitchen Section */}

      <Footer />
    </div>
  );
};

export default ProfilePage;
