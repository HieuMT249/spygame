"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameProvider, useGameContext } from '@/contexts/GameContext';
import { RoomLobby } from '@/components/lobby/RoomLobby';
import { RevealCard } from '@/components/game/RevealCard';
import { VotingScreen } from '@/components/game/VotingScreen';
import { ResultScreen } from '@/components/game/ResultScreen';
import { WhiteHatGuessScreen } from '@/components/game/WhiteHatGuessScreen';
import { EndGameScreen } from '@/components/game/EndGameScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { joinExistingRoom } from '@/services/roomService';
import { Ghost, LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ── Join Gate — hiện khi vào link nhưng chưa có trong phòng ─────────────────

const JoinGate = ({ roomCode }: { roomCode: string }) => {
  const { room, setCurrentPlayerId } = useGameContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!room) return null;

  const isRoomOpen = room.status === 'waiting';

  const handleJoin = async () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên của bạn'); return; }
    try {
      setIsLoading(true);
      const { playerId } = await joinExistingRoom(roomCode, name.trim());
      localStorage.setItem(`spy_game_player_${roomCode}`, playerId);
      setCurrentPlayerId(playerId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể tham gia phòng';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-150" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
              <Ghost className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Room code */}
        <p className="text-center text-white/30 text-xs tracking-[0.3em] uppercase mb-1">Mã phòng</p>
        <p className="text-center text-3xl font-black text-white tracking-widest mb-6">{roomCode}</p>

        {isRoomOpen ? (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/8 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <label className="block text-xs text-white/35 uppercase tracking-widest font-semibold mb-2">
                Tên người chơi
              </label>
              <Input
                placeholder="Nhập tên của bạn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleJoin()}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30"
                maxLength={20}
                autoFocus
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={!name.trim() || isLoading}
              className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white disabled:opacity-40"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'Đang vào...' : 'Vào Phòng'}
            </Button>
            <Link href="/" className="flex items-center justify-center gap-1.5 text-white/25 hover:text-white/50 transition-colors text-xs mt-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
            </Link>
          </div>
        ) : (
          // Phòng đang chơi — không cho join
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/8 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <Ghost className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg mb-1">Phòng đang chơi</p>
              <p className="text-white/40 text-sm">Không thể tham gia khi game đã bắt đầu. Hãy chờ ván tiếp theo!</p>
            </div>
            <Link href="/" className="flex items-center justify-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm mt-2">
              <ArrowLeft className="w-4 h-4" /> Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Game Router ───────────────────────────────────────────────────────────────

const GameRouter = ({ roomCode }: { roomCode: string }) => {
  const { room, loading, error, currentPlayer } = useGameContext();

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

  // Chưa có trong phòng → hiện Join Gate
  if (!currentPlayer) {
    return <JoinGate roomCode={roomCode} />;
  }

  switch (room.status) {
    case 'waiting':        return <RoomLobby />;
    case 'revealing':      return <RevealCard />;
    case 'voting':         return <VotingScreen />;
    case 'result':         return <ResultScreen />;
    case 'whitehat-guess': return <WhiteHatGuessScreen />;
    case 'finished':       return <EndGameScreen />;
    default:
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
          <p>Trạng thái không xác định: {room.status}</p>
        </div>
      );
  }
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = use(params);
  return (
    <GameProvider roomCode={roomCode}>
      <GameRouter roomCode={roomCode} />
    </GameProvider>
  );
}