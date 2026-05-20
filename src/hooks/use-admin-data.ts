import { useMemo, useEffect, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import type { Barber, Review, Customer } from '@/models/types';

export interface EnrichedReview extends Review {
  barberName: string;
}

export function useAdminData() {
  const firestore = useFirestore();
  const { isAdmin } = useUser();
  const [isDataLoading, setIsDataLoading] = useState(true);

  const barbersQuery = useMemo(
    () => (!firestore || !isAdmin ? null : collection(firestore, 'barbers')),
    [firestore, isAdmin],
  );
  const usersQuery = useMemo(
    () => (!firestore || !isAdmin ? null : collection(firestore, 'users')),
    [firestore, isAdmin],
  );
  const reviewsQuery = useMemo(
    () => (!firestore || !isAdmin ? null : query(collectionGroup(firestore, 'reviews'))),
    [firestore, isAdmin],
  );

  const { data: barbers, isLoading: barbersLoading } = useCollection<Barber>(barbersQuery);
  const { data: users, isLoading: usersLoading } = useCollection<Customer>(usersQuery);
  const { data: allReviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

  const enrichedReviews = useMemo<EnrichedReview[]>(() => {
    if (!allReviews || !barbers) return [];
    const map = new Map(barbers.map((b) => [b.id, b.name]));
    return allReviews.map((r) => ({
      ...r,
      barberName: map.get(r.barberId) ?? 'Barbeiro Desconhecido',
    }));
  }, [allReviews, barbers]);

  useEffect(() => {
    if (isAdmin && !barbersLoading && !usersLoading && !reviewsLoading) setIsDataLoading(false);
  }, [isAdmin, barbersLoading, usersLoading, reviewsLoading]);

  return { barbers, users, enrichedReviews, isDataLoading };
}
