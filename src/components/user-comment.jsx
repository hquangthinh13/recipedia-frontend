import React, { use, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/formatDate';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/api';

const UserComment = ({ comment, recipeId, onDelete }) => {
  const { user: me } = useAuth();
  const { user, text, createdAt, _id: commentId } = comment;
  const isOwner = me && String(me.id) === String(user?._id || user);
  const [deleting, setDeleting] = useState(false);
  const avatarUrl =
    user?.avatar ||
    `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(
      user?.name || 'U',
    )}&backgroundColor=ffd5dc,ffdfbf&rounded=true`;
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/recipes/${recipeId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDeleting(false);
      toast.success('Comment deleted');
      if (onDelete) onDelete(commentId);
    } catch (error) {
      setDeleting(false);
      console.error(error);
      toast.error('Failed to delete comment');
    }
  };
  return (
    <div className="flex gap-3 px-2 py-3 border-b bg-white hover:bg-secondary last:border-none transition-colors ease-in-out duration-300">
      <Link to={`/profile/${user?._id}`} className="cursor-pointer w-10 h-10 flex-shrink-0">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={user?.name || 'User'} />
          <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col flex-1">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col items-start">
            <Link to={`/profile/${user?._id}`}>
              <p className="cursor-pointer font-medium text-sm text-foreground hover:text-accent">
                {user?.name || 'Mysterious Chef'}
              </p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {createdAt ? formatDate(new Date(createdAt)) : ''}
            </p>
          </div>
          {isOwner && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <Trash />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete comment?</DialogTitle>
                  <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <DialogClose asChild>
                    <Button className="cursor-pointer" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={deleting}
                    className="cursor-pointer"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
};

export default UserComment;
