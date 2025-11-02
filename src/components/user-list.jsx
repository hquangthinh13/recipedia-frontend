import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const UserList = ({ users: initialUsers, type, isOwner, onDeltaFollowing }) => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState(initialUsers || []);

  const toggleFollow = async (row) => {
    try {
      const res = await api.post(`/users/${row._id}/follow`);
      const nowFollowing = !!res.data.isFollowing;

      // OWNER VIEW
      if (isOwner) {
        if (type === "following") {
          // owner sees their own following list; unfollow should remove the row
          if (!nowFollowing) {
            setUsers((prev) => prev.filter((u) => u._id !== row._id));
            onDeltaFollowing?.(-1); // owner’s followingCount --
          }
          return;
        }
        // type === "followers": owner can follow back/unfollow in place
        setUsers((prev) =>
          prev.map((u) =>
            u._id === row._id ? { ...u, isFollowing: nowFollowing } : u
          )
        );
        onDeltaFollowing?.(nowFollowing ? +1 : -1); // owner’s followingCount +/- accordingly
        return;
      }

      // NON-OWNER VIEW
      // You’re looking at someone else’s lists:
      // - Do not remove rows (it’s not your list).
      // - Just flip your relation icon in-place; never touch viewed profile’s counts.
      setUsers((prev) =>
        prev.map((u) =>
          u._id === row._id ? { ...u, isFollowing: nowFollowing } : u
        )
      );
      // No onDeltaFollowing here — viewed profile header must not change.
    } catch (e) {
      console.error("Follow/unfollow failed:", e);
    }
  };

  return (
    <div className="divide-y rounded-md border bg-white">
      {users.map((u) => {
        const isSelf = authUser?._id === u._id || authUser?.id === u._id;
        const avatarUrl =
          u.avatar ||
          `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
            u.name || "U"
          )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;

        // Button rules
        let showPlus = false;
        let showMinus = false;

        if (isOwner) {
          if (type === "following") {
            // Every row is followed by owner → only UNFOLLOW
            showMinus = true;
          } else {
            // followers: show plus if owner doesn't follow them; minus if they do
            showPlus = !u.isFollowing;
            showMinus = !!u.isFollowing;
          }
        } else {
          // Not owner: let user follow/unfollow anyone in the list based on their own relation.
          showPlus = !u.isFollowing;
          showMinus = !!u.isFollowing;
        }

        return (
          <div
            key={`${u._id}-${type}`}
            className="flex justify-between items-center px-3 py-3 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Link to={`/profile/${u._id}`} className="w-10 h-10">
                <Avatar>
                  <AvatarImage src={avatarUrl} alt={u.name || "User"} />
                  <AvatarFallback>
                    {u.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link to={`/profile/${u._id}`}>
                <p className="font-medium text-sm text-foreground hover:text-accent">
                  {u.name || "Mysterious Chef"}
                </p>
              </Link>
            </div>

            {!isSelf && (
              <div className="flex">
                {showPlus && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleFollow(u)}
                    title="Follow"
                    className="cursor-pointer"
                  >
                    <UserPlus />
                  </Button>
                )}
                {showMinus && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleFollow(u)}
                    title="Unfollow"
                    className="cursor-pointer"
                  >
                    <UserMinus />
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
