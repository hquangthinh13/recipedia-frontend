import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "../lib/formatDate";

const UserComment = ({ comment }) => {
  const { user, text, createdAt } = comment;
  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
      user?.name || "U"
    )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;

  return (
    <div className="flex gap-3 px-2 py-3 border-b bg-white hover:bg-secondary last:border-none transition-colors ease-in-out duration-300">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
        <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <p className="cursor-pointer font-medium text-sm text-foreground hover:text-accent">
            {user?.name || "Mysterious Chef"}
          </p>
          <p className="text-xs text-muted-foreground">
            {createdAt ? formatDate(new Date(createdAt)) : ""}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
          {text}
        </p>
      </div>
    </div>
  );
};

export default UserComment;
