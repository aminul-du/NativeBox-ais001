'use client';

import React, { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
} from '@livekit/components-react';
import Assistant3DCanvas from './Assistant3DCanvas';

export default function ShorbornoVoiceRoom() {
  const [token, setToken] = useState('');

  useEffect(() => {
    fetch('/api/livekit/token')
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
        }
      });
  }, []);

  if (token === '') {
    return <div>Connecting to ShorbornoAI...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://mock-livekit-server'}
      token={token}
      connect={true}
      audio={true}
    >
      <VoiceAssistantIntegration />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function VoiceAssistantIntegration() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="relative w-full h-screen bg-slate-900">
      <Assistant3DCanvas audioTrack={audioTrack?.publication?.track?.mediaStreamTrack} agentState={state as any} />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white">
        <div className="text-xl capitalize font-semibold">{state}</div>
        {audioTrack && (
          <div className="h-16 w-64 bg-slate-800 rounded-full flex items-center justify-center p-4">
             <BarVisualizer trackRef={audioTrack} className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
}
