import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/page-footer";
import RecipeCardHorizontal from "../components/recipe-card-horizontal";
import coverImage from "../assets/images/Background.png";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Spinner from "../components/spinner";
import { toast } from "sonner";
import { UserPlus, UserMinus, SquarePen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditRecipeForm from "../components/edit-recipe-form";

import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { getTotalLikes } from "../lib/getTotalLikes";
import { formatFollowerCount } from "../lib/formatFollowerCount";
import UserList from "../components/user-list";
const ProfilePage = () => {
  const { id } = useParams();
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = authUser?._id === id || authUser?.id === id;
  const totalLikes = getTotalLikes(recipes);
  const [open, setOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [listType, setListType] = useState(""); // "followers" or "following"
  const [isFollowing, setIsFollowing] = useState(false);
  const location = useLocation();
  const { token } = useAuth();
  // Close dialog whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleOpenList = async (type) => {
    try {
      // 1) fetch the viewed user's list
      const res = await api.get(`/users/${id}/${type}`);
      let list = res.data[type] || [];

      // 2) annotate with YOUR follow state (for button logic) if logged in
      if (authUser?.id || authUser?._id) {
        const meId = authUser.id || authUser._id;
        const mine = await api.get(`/users/${meId}/following`);
        const followingSet = new Set(
          (mine.data.following || []).map((u) => u._id)
        );

        list = list.map((u) => {
          // owner + following: you follow *all* the rows by definition
          if (isOwner && type === "following")
            return { ...u, isFollowing: true };
          // otherwise infer from your following set
          return { ...u, isFollowing: followingSet.has(u._id) };
        });
      }

      setUserList(list);
      setListType(type);
      setOpen(true);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    }
  };
  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("Please log in to follow this chef.");
      return;
    }
    try {
      const res = await api.post(`/users/${id}/follow`);

      // Update button and counts
      setIsFollowing(res.data.isFollowing);
      setProfile((prev) => ({
        ...prev,
        followersCount: res.data.followersCount, // update follower count
      }));
    } catch (err) {
      console.error("Follow toggle failed:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/profile`);
        setProfile(res.data.user);
        setRecipes(res.data.recipes);
        setIsFollowing(res.data.isFollowing || false);
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
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!profile)
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
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
                {profile.name}{" "}
                {/* {isOwner ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="cursor-pointer"
                  >
                    <SquarePen />
                  </Button>
                ) : null} */}
              </h2>
              <span className=" text-muted-foreground text-sm leading-2">
                Joined {joinedDate}
              </span>{" "}
              {/* Stats */}
              <div className="mt-2 flex-row flex w-full justify-center items-center gap-6">
                {/* Following */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span
                    onClick={() => handleOpenList("following")}
                    className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent"
                  >
                    {formatFollowerCount(profile.followingCount)}
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">
                    following
                  </span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Followers */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span
                    onClick={() => handleOpenList("followers")}
                    className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent"
                  >
                    {formatFollowerCount(profile.followersCount)}
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
                {!isOwner && (
                  //  (
                  // <Button className="cursor-pointer">
                  //   <SquarePen />
                  //   Edit Profile
                  // </Button>
                  // ) :
                  <Button
                    className="cursor-pointer"
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "secondary" : "default"}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            {/* Content directly below the grouped block */}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-row gap-4 w-full mx-auto justify-center">
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
                    onEdit={(recipe) => {
                      setEditingRecipe(recipe);
                      setEditOpen(true);
                    }}
                    onDelete={(id) => {
                      // remove the recipe from the local state
                      setRecipes((prev) =>
                        prev.filter((rec) => rec._id !== id)
                      );
                    }}
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>

          {editingRecipe && (
            <EditRecipeForm
              recipe={editingRecipe}
              onClose={() => setEditOpen(false)}
              onUpdated={(updated) => {
                setRecipes((prev) =>
                  prev.map((r) => (r._id === updated._id ? updated : r))
                );
                setEditOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {listType === "followers" ? "Followers" : "Following"}
            </DialogTitle>

            {/* This description now re-renders automatically */}
            <DialogDescription key={`${listType}-${userList.length}`}>
              {listType === "followers"
                ? `${profile?.followersCount ?? 0} followers`
                : `${profile?.followingCount ?? 0} following`}
            </DialogDescription>
          </DialogHeader>

          {userList.length > 0 && (
            <UserList
              users={userList}
              type={listType}
              isOwner={isOwner}
              onDeltaFollowing={(delta) => {
                // Only update the header counts if you are viewing your own profile
                if (!isOwner) return;
                if (!delta) return;

                setProfile((prev) => ({
                  ...prev,
                  // Only followingCount changes from actions inside the dialogs
                  followingCount: Math.max(
                    0,
                    (prev.followingCount || 0) + delta
                  ),
                }));

                // Also update the dialog list “count” live when the row is removed in “following”
                if (listType === "following" && delta < 0) {
                  setUserList((prev) => prev.slice()); // trigger re-render (already removed in child)
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
