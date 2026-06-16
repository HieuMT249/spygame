"use client";

import { use } from 'react';
import { GameProvider, useGameContext } from '@/contexts/GameContext';
import { RoomLobby } from '@/components/lobby/RoomLobby';
import { RevealCard } from '@/components/game/RevealCard';
import { VotingScreen } from '@/components/game/VotingScreen';
import { ResultScreen } from '@/components/game/ResultScreen';
import { WhiteHatGuessScreen } from '@/components/game/WhiteHatGuessScreen';
import { EndGameScreen } from '@/components/game/EndGameScreen';
import { Ghost } from 'lucide-react';
import Link from 'next/link';

const GameRouter = () => {
  const { room, loading, error } = useGameContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Ghost className="w-12 h-12 animate-bounce mb-4 text-slate-500" />
        <p className="animate-pulse">Đang kết nối vào phòng...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 max-w-md">
          <p className="text-red-400 mb-4 font-medium">Không tìm thấy phòng hoặc đã có lỗi xảy ra.</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  switch (room.status) {
    case 'waiting':
      return <RoomLobby />;
    case 'revealing':
      return <RevealCard />;
    case 'voting':
      return <VotingScreen />;
    case 'result':
      return <ResultScreen />;
    case 'whitehat-guess':
      return <WhiteHatGuessScreen />;
    case 'finished':
      return <EndGameScreen />;
    default:
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
          <p>Trạng thái không xác định: {room.status}</p>
        </div>
      );
  }
};

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const resolvedParams = use(params);
  return (
    <GameProvider roomCode={resolvedParams.roomCode}>
      <GameRouter />
    </GameProvider>
  );
}