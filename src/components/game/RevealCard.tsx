"use client";

import { useState, useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { updatePlayer } from '@/lib/firebase/players';
import { updateRoom } from '@/lib/firebase/rooms';
import { Eye, EyeOff, User, Ghost, HelpCircle, HatGlasses } from 'lucide-react';

export const RevealCard = () => {
  const { room, players, currentPlayer, isHost } = useGameContext();
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(currentPlayer?.hasRevealedCard || false);

  if (!room || !currentPlayer) return null;

  const allRevealed = players.every((p) => !p.alive || p.hasRevealedCard);

  // Auto transition to discussion when everyone has revealed
  useEffect(() => {
    if (isHost && allRevealed && room.status === 'revealing') {
      const timer = setTimeout(() => {
        updateRoom(room.id, { status: 'voting' });
      }, 3000); // Wait 3 seconds after the last person reveals
      return () => clearTimeout(timer);
    }
  }, [isHost, allRevealed, room.id, room.status]);

  const handleReveal = async () => {
    if (!hasRevealed) {
      setIsFlipped(true);
      setHasRevealed(true);
      await updatePlayer(room.id, currentPlayer.id, { hasRevealedCard: true });
      
      // Auto flip back after 3 seconds
      setTimeout(() => {
        setIsFlipped(false);
      }, 3000);
    }
  };

  const getWord = () => {
    if (currentPlayer.role === 'citizen') return room.citizenWord;
    if (currentPlayer.role === 'spy') return room.spyWord;
    return '???'; // White hat
  };

  const getRoleIcon = () => {
    if (currentPlayer.role === 'citizen') return <User className="w-16 h-16 text-blue-400" />;
    if (currentPlayer.role === 'spy') return <Ghost className="w-16 h-16 text-red-400" />;
    return <HatGlasses className="w-16 h-16 text-slate-300" />;
  };

  const getRoleName = () => {
    if (currentPlayer.role === 'citizen') return 'Dân Thường';
    if (currentPlayer.role === 'spy') return 'Gián Điệp';
    return 'Mũ Trắng';
  };

  const getRoleColor = () => {
    if (currentPlayer.role === 'citizen') return 'from-blue-600 to-teal-500';
    if (currentPlayer.role === 'spy') return 'from-red-600 to-orange-500';
    return 'from-slate-600 to-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Xem Thẻ Của Bạn</h2>
        <p className="text-slate-400">
          {allRevealed 
            ? "Mọi người đã xem xong. Chuẩn bị bỏ phiếu..." 
            : "Vui lòng giữ bí mật thẻ của mình"}
        </p>
      </div>

      <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000 mb-8 mx-auto">
        <div 
          className={`w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => {
            // Can peek again if already revealed
            if (hasRevealed) {
              setIsFlipped(!isFlipped);
              if (!isFlipped) setTimeout(() => setIsFlipped(false), 3000);
            }
          }}
        >
          {/* Card Back */}
          <Card className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-slate-800 opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="w-24 h-32 border-2 border-slate-700/50 rounded-lg flex items-center justify-center mb-6 relative">
              <EyeOff className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-xl font-bold text-slate-300">THẺ CỦA BẠN</p>
          </Card>

          {/* Card Front */}
          <Card className={`absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br ${getRoleColor()} border-0 flex flex-col items-center justify-center shadow-2xl p-6`}>
            <div className="bg-slate-950/40 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center w-full h-full relative overflow-hidden">
              <div className="flex-1 flex items-center justify-center">
                {getRoleIcon()}
              </div>
              <div className="space-y-2 text-center mt-auto w-full">
                <p className="text-sm uppercase tracking-widest text-slate-300 font-semibold">{getRoleName()}</p>
                <div className="bg-slate-950/50 rounded-xl py-4 px-6 border border-white/10">
                  <p className="text-2xl md:text-3xl font-black text-white" title={getWord()}>
                    {getWord()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm gap-4">
        {!hasRevealed ? (
          <Button 
            onClick={handleReveal}
            className="w-full h-14 text-lg font-bold bg-white text-slate-950 hover:bg-slate-200"
          >
            <Eye className="w-5 h-5 mr-2" />
            Nhấn để xem thẻ
          </Button>
        ) : (
          <div className="text-center w-full p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-slate-300 flex items-center justify-center gap-2">
              {allRevealed ? (
                <span className="text-green-400">Chuẩn bị chuyển sang bỏ phiếu...</span>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  Đang đợi những người khác xem thẻ...
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};