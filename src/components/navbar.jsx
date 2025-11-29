import React from 'react';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NotificationPopover } from './notification-popover';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Timer } from './timer';
import SearchBar from '/src/components/searchbar.jsx';
const FallBackAvatar = `https://api.dicebear.com/9.x/micah/svg?randomizeIds=false&flip=true&baseColor=f9c9b6&hair=turban&hairColor=ffeba4&&mouth=frown&shirt=collared&shirtColor=77311d&backgroundColor=ffdfbf`;

const Navbar = ({ needTimer }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-1">
            <img
              src={logo}
              alt="Recipedia Logo"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          {needTimer ? <Timer /> : <SearchBar />}
          {/* Right section */}{' '}
          {user ? (
            <div className="flex flex-1 items-center gap-2 justify-end">
              {/* Create Recipe */}
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => navigate('/create')}
              >
                <Plus className="" />
                Post
              </Button>
              <NotificationPopover />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.avatar || FallBackAvatar}
                      alt={user?.name || user?.email || 'Guest'}
                    />
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuLabel className="truncate">
                    {user.name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    My Kitchen
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/customize-avatar')}
                  >
                    Dress Your Chef
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/analytics')}
                  >
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/change-password')}
                  >
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2 justify-end">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigate('/login')}
              >
                {/* <LogIn /> */}
                Log in
              </Button>
              <Button
                variant="default"
                className="cursor-pointer"
                onClick={() => navigate('/signup')}
              >
                {/* <UserPlus /> */}
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
