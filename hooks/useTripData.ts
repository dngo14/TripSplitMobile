import { useState, useEffect, useCallback } from 'react';
import { getUserTrips, subscribeToUserTrips, getTrip, subscribeToTrip, createTrip as createTripDB, updateTrip as updateTripDB, deleteTrip as deleteTripDB, addMemberToTrip, removeMemberFromTrip } from '../lib/database';
import { useAuth } from '../components/contexts/AuthContext';

export const useTrips = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useTrips: Setting up subscription, user:', user?.uid || 'none');
    
    if (!user) {
      console.log('useTrips: No user, clearing trips');
      setTrips([]);
      setLoading(false);
      return;
    }

    console.log('useTrips: User available, setting up subscription');
    setLoading(true);
    
    const unsubscribe = subscribeToUserTrips((updatedTrips) => {
      console.log('useTrips: Received trips:', updatedTrips.length);
      setTrips(updatedTrips);
      setLoading(false);
      setError(null);
    });

    return () => {
      console.log('useTrips: Cleaning up subscription');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const refetch = useCallback(async () => {
    try {
      console.log('useTrips: Manual refetch');
      setLoading(true);
      const userTrips = await getUserTrips();
      console.log('useTrips: Got trips:', userTrips.length);
      setTrips(userTrips);
      setError(null);
    } catch (err) {
      console.error('useTrips: Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData: any) => {
    try {
      const tripId = await createTripDB(tripData);
      console.log('Trip created with ID:', tripId);
      return tripId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      throw err;
    }
  }, []);

  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      await deleteTripDB(tripId);
      console.log('Trip deleted:', tripId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      throw err;
    }
  }, []);

  return {
    trips,
    loading,
    error,
    refetch,
    createTrip,
    deleteTrip,
  };
};

export const useTrip = (tripId: string | null) => {
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupSubscription = () => {
      unsubscribe = subscribeToTrip(tripId, (updatedTrip) => {
        setTrip(updatedTrip);
        setLoading(false);
        if (!updatedTrip) {
          setError('Trip not found');
        } else {
          setError(null);
        }
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tripId]);

  const updateTrip = useCallback(async (updates: any) => {
    if (!tripId) return;
    
    try {
      await updateTripDB(tripId, updates);
      console.log('Trip updated:', tripId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trip');
      throw err;
    }
  }, [tripId]);

  const addMember = useCallback(async (member: any) => {
    if (!tripId) return;
    
    try {
      await addMemberToTrip(tripId, member);
      console.log('Member added successfully:', tripId, member);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      throw err;
    }
  }, [tripId]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!tripId) return;
    
    try {
      await removeMemberFromTrip(tripId, memberId);
      console.log('Member removed successfully:', tripId, memberId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      throw err;
    }
  }, [tripId]);

  const addExpense = useCallback(async (expense: any) => {
    if (!tripId) return;
    
    try {
      // TODO: Implement addExpense in database.ts
      console.log('Adding expense:', tripId, expense);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      throw err;
    }
  }, [tripId]);

  const updateExpense = useCallback(async (expenseId: string, updates: any) => {
    if (!tripId) return;
    
    try {
      // TODO: Implement updateExpense in database.ts
      console.log('Updating expense:', tripId, expenseId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, [tripId]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    if (!tripId) return;
    
    try {
      // TODO: Implement deleteExpense in database.ts
      console.log('Deleting expense:', tripId, expenseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, [tripId]);

  const addChatMessage = useCallback(async (message: any) => {
    if (!tripId) return;
    
    try {
      // TODO: Implement addChatMessage in database.ts
      console.log('Adding chat message:', tripId, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
      throw err;
    }
  }, [tripId]);

  const addItineraryItem = useCallback(async (item: any) => {
    if (!tripId) return;
    
    try {
      // TODO: Implement addItineraryItem in database.ts
      console.log('Adding itinerary item:', tripId, item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add itinerary item');
      throw err;
    }
  }, [tripId]);

  return {
    trip,
    loading,
    error,
    updateTrip,
    addMember,
    removeMember,
    addExpense,
    updateExpense,
    deleteExpense,
    addChatMessage,
    addItineraryItem,
  };
};