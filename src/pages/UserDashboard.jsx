import React, { useEffect } from 'react';
import Footer from '@/components/page-footer';
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

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Recipedia | Analytics';
  }, []);
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
  return (
    <div className="min-h-screen">
      <div className="flex mt-2 flex-col mx-auto max-w-6xl px-4 py-4 gap-4">
        <UserInteractionDataCard />{' '}
        <div className="flex flex-row gap-4">
          <AnalyticsCard className="flex flex-1" type="like" />
          <AnalyticsCard className="flex flex-1" type="comment" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
