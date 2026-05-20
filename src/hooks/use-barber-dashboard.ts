import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { Appointment, Review } from '@/models/types';
import { startOfDay } from 'date-fns';

export function useBarberDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const today = useMemo(() => startOfDay(new Date()).toISOString(), []);

  const appointmentsQuery = useMemo(
    () =>
      !firestore || !user
        ? null
        : query(
            collection(firestore, 'barbers', user.uid, 'appointments'),
            where('startTime', '>=', today),
            orderBy('startTime', 'asc'),
          ),
    [firestore, user, today],
  );

  const reviewsQuery = useMemo(
    () =>
      !firestore || !user
        ? null
        : query(collection(firestore, 'barbers', user.uid, 'reviews'), orderBy('date', 'desc')),
    [firestore, user],
  );

  const { data: appointments, isLoading: appLoading } =
    useCollection<Appointment>(appointmentsQuery);
  const { data: reviews, isLoading: revLoading } = useCollection<Review>(reviewsQuery);

  return { appointments, appLoading, reviews, revLoading };
}
