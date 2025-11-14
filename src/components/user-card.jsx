import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatDate';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { formatFollowerCount } from '@/lib/formatFollowerCount';

const UserCard = ({ rank, user }) => {
  return (
    <Card className="mx-auto w-full hover:shadow-lg transition overflow-hidden delay-150 duration-300 ease-in-out">
      <CardContent className="p-4 space-y-4">
        {/* Content directly below the grouped block */}
        <div className="text-center">
          <div className="relative flex justify-center ">
            <Link to={`/profile/${user._id}`} className="relative">
              <Avatar className="object-cover w-24 h-24 cursor-pointer hover:brightness-95 transition duration-300 ">
                <AvatarImage src={user.avatar} alt={user.name} />
              </Avatar>
              {user.rank && (
                <div
                  className={`border-card border-3 ${
                    user.rank === 1 ? 'bg-primary' : 'bg-accent'
                  } h-8 w-8 rounded-full absolute bottom-0.5 right-0 flex items-center justify-center`}
                >
                  <span className="text-sm text-white font-medium">{user.rank}</span>
                </div>
              )}
            </Link>
          </div>
          <Link to={`/profile/${user._id}`} className="w-full flex justify-center">
            <h2 className="w-fit pt-2 text-xl font-bold text-[var(--card-foreground)] antialiased hover:text-accent transition-colors duration-100">
              {user.name}
            </h2>
          </Link>
          <span className=" text-muted-foreground text-sm leading-2">
            Joined {formatDate(user.createdAt)}
          </span>{' '}
          {/* Stats */}
          <div className="mt-2 flex-row flex w-full justify-center items-center gap-6">
            {/* recipes */}
            <div className="w-16 flex flex-col gap-0 items-center justify-center">
              <span className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent">
                {formatFollowerCount(user.totalRecipes)}
              </span>
              <span className="text-muted-foreground text-sm ">recipes</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Followers */}
            <div className="w-16 flex flex-col gap-0 items-center justify-center">
              <span
                // onClick={() => handleOpenList("followers")}
                className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent"
              >
                {formatFollowerCount(user.followersCount)}
              </span>
              <span className="text-muted-foreground text-sm">followers</span>
            </div>

            <Separator orientation="vertical" className="h-6" />
            {/* Likes */}
            <div className="w-16 flex flex-col gap-0 items-center justify-center">
              <span className="text-lg font-bold text-[var(--card-foreground)] cursor-pointer hover:text-accent">
                {user.totalLikes}
              </span>
              <span className="text-muted-foreground text-sm ">likes</span>
            </div>
          </div>{' '}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
