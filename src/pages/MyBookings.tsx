import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingHistory from '@/components/BookingHistory';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const MyBookings = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BookingHistory />
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
