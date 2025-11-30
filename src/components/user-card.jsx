import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatDate';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { formatFollowerCount } from '@/lib/formatFollowerCount';
import { Soup, Heart, Users } from 'lucide-react';
import { removeBackgroundColor, flip, replaceFaceParams } from '@/lib/avatarModifier';

function getChefTitle(rank) {
  switch (rank) {
    case 1:
      return 'Master';
    case 2:
      return 'Sous';
    case 3:
      return 'Senior';
    case 4:
      return 'Junior';
    case 5:
      return 'Novice';
    case 6:
      return 'Rookie';
    default:
      return 'Chef';
  }
}

const UserCard = ({ user }) => {
  return (
    <Card className="relative h-fit flex flex-row justify-center items-end mx-auto w-full hover:shadow-lg transition delay-150 duration-300 ease-in-out">
      <div className="flex items-center">
        <div className="flex z-20 w-36 h-36 relative group mt-4 ml-2">
          <img
            src={removeBackgroundColor(flip(user.avatar))}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-10 opacity-100 group-hover:opacity-0"
            alt="Default avatar"
          />
          <img
            src={replaceFaceParams(flip(user.avatar))}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-10 opacity-0 group-hover:opacity-100"
            alt="Smiling avatar"
          />
        </div>
        <div className="flex flex-1 flex-col items-start justify-start pr-4 py-4 space-y-0">
          <span
            className={`flex flex-row items-center gap-1 uppercase font-medium tracking-widest text-xs 
    ${user.rank < 4 ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {/* {user.rank < 2 && <Trophy className="h-4 w-4" />} */}
            {getChefTitle(user.rank)}
          </span>
          <Link to={`/profile/${user._id}`} className="flex">
            <h2 className="w-fit text-xl font-bold text-card-foreground antialiased hover:text-accent transition-colors duration-100">
              {user.name}
            </h2>
          </Link>
          <span className="mt-4 text-muted-foreground text-xs">
            Joined {formatDate(user.createdAt)}
          </span>{' '}
          <div className="mt-2 flex items-center gap-2">
            <span className="flex flex-row items-center gap-2 text-xs font-semibold text-card-foreground ">
              <Soup className="h-3 w-3 text-muted-foreground" />
              {formatFollowerCount(user.totalRecipes)}
            </span>

            <Separator orientation="vertical" className="h-4" />

            <span className="flex flex-row items-center gap-2 text-xs font-semibold text-card-foreground ">
              <Users className="h-3 w-3 text-muted-foreground" />
              {formatFollowerCount(user.followersCount)}
            </span>

            <Separator orientation="vertical" className="h-4" />

            <span className="flex flex-row items-center gap-2 text-xs font-semibold text-card-foreground ">
              <Heart className="h-3 w-3 text-muted-foreground" />
              {formatFollowerCount(user.totalLikes)}
            </span>
          </div>{' '}
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
