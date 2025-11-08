import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const PreviewUserCard = ({ avatarUrl, name, createdAt }) => {
  return (
    <Card className="hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      <CardContent className="p-4 space-y-4">
        <h2 className="flex text-center items-center justify-center text-2xl font-bold text-card-foreground antialiased">
          Dress Your Chef
        </h2>
        <div className="text-center">
          <div className="relative flex justify-center ">
            <Avatar className="object-cover w-24 h-24 cursor-pointer hover:brightness-95 transition duration-300 ">
              <AvatarImage src={avatarUrl} alt={name} />
            </Avatar>
          </div>
          <h2 className="flex w-full justify-center pt-2 text-xl font-bold text-[var(--card-foreground)] antialiased hover:text-accent transition-colors duration-100">
            {name}
          </h2>
          <span className=" text-muted-foreground text-sm leading-2">
            Joined {formatDate(createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewUserCard;
