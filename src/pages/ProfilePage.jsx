import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import RecipeCardHorizontal from '@/components/recipe-card-horizontal';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/spinner';
import { toast } from 'sonner';
import { UserPlus, UserMinus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditRecipeForm from '@/components/edit-recipe-form';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { getTotalLikes } from '@/lib/getTotalLikes';
import { formatFollowerCount } from '@/lib/formatFollowerCount';
import UserList from '@/components/user-list';
const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [favRecipes, setFavRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwner = authUser?._id === id || authUser?.id === id;
  const totalLikes = getTotalLikes(recipes);
  const [open, setOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [listType, setListType] = useState(''); // "followers" or "following"
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
        const followingSet = new Set((mine.data.following || []).map((u) => u._id));

        list = list.map((u) => {
          // owner + following: you follow *all* the rows by definition
          if (isOwner && type === 'following') return { ...u, isFollowing: true };
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
      toast.error('Please log in to follow this chef');
      return;
    }
    try {
      setFollowing(true);
      const res = await api.post(`/users/${id}/follow`);
      toast.success(res.data.msg);
      // Update button and counts
      setIsFollowing(res.data.isFollowing);
      setProfile((prev) => ({
        ...prev,
        followersCount: res.data.followersCount, // update follower count
      }));
    } catch (err) {
      console.error('Follow toggle failed:', err);
      toast.error('Failed to update follow status');
    } finally {
      setFollowing(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}/profile`);
        console.log('Profile data:', res.data);
        setProfile(res.data.user);
        setFavRecipes(res.data.favorites);
        setRecipes(res.data.recipes);
        setIsFollowing(res.data.isFollowing || false);
        document.title = `Kitchen | ${res.data.user.name}`;
      } catch (err) {
        console.error('Failed to fetch profile:', err);
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
      <div className="min-h-screen flex justify-center items-center">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia>
              <Link to={'/'} className="flex flex-1">
                <img src={logo} alt="Recipedia Logo" className="h-12" />
              </Link>
            </EmptyMedia>
            <EmptyTitle>Kitchen not available</EmptyTitle>
            <EmptyDescription>
              We couldn’t load this user’s profile. It might have been removed or made private.
            </EmptyDescription>
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

  const joinedDate = profile.createdAt
    ? format(new Date(profile.createdAt), 'MMM d, yyyy')
    : 'Unknown';
  return (
    <div className="min-h-screen">
      {/* Kitchen Section */}
      <div className="flex mt-2 flex-col mx-auto max-w-lg px-4 py-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Content directly below the grouped block */}
            <div className="text-center">
              <div className="relative flex justify-center ">
                <Avatar className="object-cover w-32 h-32 cursor-pointer hover:brightness-95 transition duration-300 ">
                  <AvatarImage src={profile.avatar || FallBackAvatar} alt={profile.name} />
                </Avatar>
              </div>
              <h2 className="pt-2 text-3xl font-bold text-card-foreground antialiased">
                {profile.name}{' '}
              </h2>
              <span className=" text-muted-foreground text-sm leading-2">Joined {joinedDate}</span>{' '}
              {/* Stats */}
              <div className="mt-2 flex-row flex w-full justify-center items-center gap-6">
                {/* Following */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span
                    onClick={() => handleOpenList('following')}
                    className="text-lg font-bold text-card-foreground cursor-pointer hover:text-accent"
                  >
                    {formatFollowerCount(profile.followingCount)}
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">following</span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Followers */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span
                    onClick={() => handleOpenList('followers')}
                    className="text-lg font-bold text-card-foreground cursor-pointer hover:text-accent"
                  >
                    {formatFollowerCount(profile.followersCount)}
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">followers</span>
                </div>

                <Separator orientation="vertical" className="h-6" />
                {/* Likes */}
                <div className="w-16 flex flex-col gap-0 items-center justify-center">
                  <span className="text-lg font-bold text-card-foreground cursor-pointer hover:text-accent">
                    {totalLikes}
                  </span>
                  <span className="text-muted-foreground text-sm leading-2">likes</span>
                </div>
              </div>
              <div className="mt-4 flex flex-row gap-4 justify-center">
                {!isOwner && (
                  <Button
                    className="cursor-pointer"
                    disabled={following}
                    onClick={handleFollowToggle}
                    variant={isFollowing ? 'secondary' : 'default'}
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
          </CardContent>
        </Card>

        <Tabs defaultValue="shared" className="mt-4 ">
          <TabsList className="flex flex-1 gap-2">
            <TabsTrigger className="cursor-pointer flex flex-1" value="shared">
              Shared Recipes
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer flex flex-1" value="favorites">
              Favorites
            </TabsTrigger>
          </TabsList>
          <TabsContent value="shared">
            <div className="flex flex-row gap-4 max-w-lg mx-auto justify-center">
              <div className="mt-2 flex flex-col gap-2">
                {recipes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {recipes.map((r) => {
                      const canEdit =
                        authUser &&
                        (authUser._id === r.author?._id || authUser.id === r.author?._id);

                      return (
                        <RecipeCardHorizontal
                          key={r._id}
                          recipe={r}
                          isOwner={!!canEdit}
                          onEdit={(recipe) => {
                            setEditingRecipe(recipe);
                            setEditOpen(true);
                          }}
                          onDelete={(id) => {
                            setRecipes((prev) => prev.filter((rec) => rec._id !== id));
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center">
                    {isOwner
                      ? "You haven't shared any recipes yet."
                      : 'This chef hasn’t shared any recipes yet.'}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="favorites">
            <div className="flex flex-row gap-4 max-w-lg mx-auto justify-center">
              <div className="mt-2 flex flex-col gap-2">
                {favRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {favRecipes.map((r) => {
                      const canEdit =
                        authUser &&
                        (authUser._id === r.author?._id || authUser.id === r.author?._id);

                      return (
                        <RecipeCardHorizontal
                          key={r._id}
                          recipe={r}
                          isOwner={!!canEdit}
                          onEdit={(recipe) => {
                            setEditingRecipe(recipe);
                            setEditOpen(true);
                          }}
                          onDelete={(id) => {
                            setRecipes((prev) => prev.filter((rec) => rec._id !== id));
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center">
                    {isOwner
                      ? "You haven't saved any recipes yet."
                      : 'This chef hasn’t saved any recipes yet.'}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby="list-desc"
          className="max-w-md max-h-[80vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{listType === 'followers' ? 'Followers' : 'Following'}</DialogTitle>

            {/* This description now re-renders automatically */}
            <DialogDescription id="list-desc" key={`${listType}-${userList.length}`}>
              {listType === 'followers'
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
                  followingCount: Math.max(0, (prev.followingCount || 0) + delta),
                }));

                // Also update the dialog list “count” live when the row is removed in “following”
                if (listType === 'following' && delta < 0) {
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
