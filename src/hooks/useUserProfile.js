import { useCallback, useEffect, useState } from 'react';
import { UserProfile } from '@/api/entities';

export { todayStr } from '@/lib/date';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const rows = await UserProfile.list('-created_date');
    setProfile(rows[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { profile, loading, reload };
}
