import { useState, useCallback, useEffect } from 'react';
import { TripService } from '../../shared/api/services/trip.service';
import { Trip, CompanyStats } from '../../types/trip';
import { ApiResponse, createInitialResponse } from '../../utils/responsePattern';

export function useCompanyDashboard() {
  const [trips, setTrips] = useState<ApiResponse<Trip[]>>(createInitialResponse([]));
  const [stats, setStats] = useState<ApiResponse<CompanyStats>>(createInitialResponse());

  const fetchData = useCallback(async () => {
    setTrips(prev => ({ ...prev, status: 'loading', error: null }));
    setStats(prev => ({ ...prev, status: 'loading', error: null }));

    // Fetch Stats
    try {
      const statsRes = await TripService.getStats();
      if (statsRes && statsRes.data && statsRes.data.success) {
        setStats({ data: statsRes.data.data, status: 'success', error: null });
      } else {
        setStats({
          data: { upcomingTrips: 0, soldTickets: 0 },
          status: 'success',
          error: (statsRes && statsRes.data && statsRes.data.message) || null
        });
      }
    } catch (err) {
      console.warn('Failed to load company dashboard stats:', err);
      setStats({
        data: { upcomingTrips: 0, soldTickets: 0 },
        status: 'success',
        error: null
      });
    }

    // Fetch Trips
    try {
      const tripsRes = await TripService.getTrips();
      if (tripsRes && tripsRes.data && tripsRes.data.success) {
        setTrips({ data: tripsRes.data.data, status: 'success', error: null });
      } else {
        setTrips({ data: [], status: 'success', error: (tripsRes && tripsRes.data && tripsRes.data.message) || null });
      }
    } catch (err) {
      console.warn('Failed to load company dashboard trips:', err);
      setTrips({ data: [], status: 'success', error: null });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    trips: trips.data || [],
    stats: stats.data,
    isLoading: trips.status === 'loading' || stats.status === 'loading',
    error: null, // Always return null to prevent blocking the entire dashboard page
    refresh: fetchData
  };
}
