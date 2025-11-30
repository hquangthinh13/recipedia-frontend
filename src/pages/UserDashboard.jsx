import React, { useEffect } from 'react';
import UserInteractionDataCard from '@/components/user-interaction-data-card';
import AnalyticsCard from '@/components/analytics-card';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ArrowLeft } from 'lucide-react';
import UserCard from '@/components/user-card';
import api from '@/lib/api';
import Spinner from '@/components/spinner';
import { getTotalLikes } from '@/lib/getTotalLikes';
import { Loader2 } from 'lucide-react';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { id } = user || {};
  const fetchProfile = async () => {
    if (!id) return; // guard in case auth user hasn’t loaded yet

    try {
      const res = await api.get(`/users/${id}/profile`);
      console.log('Profile data:', res.data);

      const { user: userData, recipes = [] } = res.data;

      const totalRecipes = recipes.length;
      const totalLikes = getTotalLikes(recipes);

      const profileForCard = {
        ...userData,
        totalRecipes,
        totalLikes,
      };

      setProfile(profileForCard);
      console.log('Profile state updated:', profileForCard);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Recipedia | Analytics Dashboard';
    // if (user?.id) {
    //   fetchProfile();
    // }
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia>
              {' '}
              <Link to={'/'} className="flex flex-1">
                <img src={logo} alt="Recipedia Logo" className="h-12" />
              </Link>
            </EmptyMedia>
            <EmptyTitle>Looks like you haven’t logged in yet</EmptyTitle>
            <EmptyDescription>
              Sign in to see your analytics and interaction trends.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button className="cursor-pointer" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button className="cursor-pointer" onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </EmptyContent>
        </Empty>{' '}
      </div>
    );
  // if (authLoading) {
  //   return (
  //     <div className="w-screen h-screen flex items-center justify-center">
  //       <Spinner />
  //     </div>
  //   );
  // }
  return (
    <div className="min-h-screen mb-24">
      <div className="flex mt-2 flex-col mx-auto max-w-6xl px-4 py-4 gap-4">
        <Link to={'/'}>
          <Button variant="ghost" className="cursor-pointer">
            <ArrowLeft />
            <div className="hidden md:flex lg:flex">Home</div>
          </Button>
        </Link>{' '}
        <div className="flex flex-col w-full gap-4">
          {' '}
          <UserInteractionDataCard />
          <div className="flex flex-row gap-4">
            {/* {!loading && (
              <div className="flex-1 flex ">
                <UserCard user={profile} />
              </div>
            )}{' '} */}
            {/* <AnalyticsCard className="flex flex-1" /> */}
            <AnalyticsCard className="flex flex-1" type="like" />
            <AnalyticsCard className="flex flex-1 " type="comment" />
          </div>{' '}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
