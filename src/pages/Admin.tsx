import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Car, MapPin, Search, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  user_id: string;
  parking_location_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  booking_status: string;
  vehicle_number: string;
  created_at: string;
  parking_locations: {
    name: string;
    address: string;
  } | null;
  profiles: {
    full_name: string;
    phone: string;
  } | null;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    todayBookings: 0
  });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    // Filter bookings based on search term
    const filtered = bookings.filter(booking => 
      booking.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.parking_locations?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_locations (
            name,
            address
          ),
          profiles (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings((data || []) as any);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        totalBookings: data?.length || 0,
        totalRevenue: data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0,
        activeBookings: data?.filter(booking => booking.booking_status === 'active').length || 0,
        todayBookings: data?.filter(booking => booking.booking_date === today).length || 0
      };
      setStats(stats);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bookings data"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Please sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage parking bookings and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBookings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayBookings}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Booking Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by vehicle, name, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </div>
                    ) : (
                      filteredBookings.map((booking) => (
                        <Card key={booking.id} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <div className="font-semibold">{booking.profiles?.full_name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.vehicle_number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {booking.profiles?.phone}
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium">{booking.parking_locations?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {booking.start_time} - {booking.end_time}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-semibold">{formatCurrency(booking.total_amount)}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.duration_hours}h • {booking.payment_method?.toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              {getStatusBadge(booking.payment_status)}
                              {getStatusBadge(booking.booking_status)}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['upi', 'card', 'qr'].map(method => {
                          const count = bookings.filter(b => b.payment_method === method).length;
                          const percentage = bookings.length > 0 ? (count / bookings.length * 100).toFixed(1) : 0;
                          return (
                            <div key={method} className="flex justify-between">
                              <span className="capitalize">{method}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {['active', 'completed', 'cancelled'].map(status => {
                          const count = bookings.filter(b => b.booking_status === status).length;
                          const percentage = bookings.length > 0 ? (count / bookings.length * 100).toFixed(1) : 0;
                          return (
                            <div key={status} className="flex justify-between">
                              <span className="capitalize">{status}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;