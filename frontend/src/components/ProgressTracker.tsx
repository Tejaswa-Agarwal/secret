'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  animeId: number;
  episodeId: string;
  episodeNum: number;
}

export default function ProgressTracker({ animeId, episodeId, episodeNum }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;
    // Save progress after 5 seconds of watching
    const timer = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, episodeId, episodeNum }),
      }).catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [animeId, episodeId, episodeNum, session]);

  return null; // invisible component
}
