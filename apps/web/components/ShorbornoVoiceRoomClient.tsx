'use client';

import dynamic from 'next/dynamic';

const ShorbornoVoiceRoom = dynamic(
  () => import('./ShorbornoVoiceRoom'),
  { ssr: false }
);

export default function ShorbornoVoiceRoomClient() {
  return <ShorbornoVoiceRoom />;
}
