"use client";

import { useState, useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useVotes } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { advanceGameAfterElimination } from '@/services/roomService';
import { updateRoom } from '@/lib/firebase/rooms';
import { Ghost, User, HelpCircle, Skull, ChevronRight, AlertTriangle, HatGlasses } from 'lucide-react';
import { toast } from 'sonner';

export const ResultScreen = () => {
  const { room, players, isHost } = useGameContext();
  const { votes } = useVotes(room?.id || null, room?.currentRound || 1);
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!room) return null;

  const eliminatedPlayer = players.find(p => p.id === room.eliminatedPlayerId);

  const handleNext = async () => {
    try {
      if (eliminatedPlayer?.role === 'white') {
        await updateRoom(room.id, { status: 'whitehat-guess' });
      } else {
        await advanceGameAfterElimination(room.id);
      }
    } catch (error) {
      toast.error('Lỗi khi tiếp tục');
    }
  };

  const getRoleIcon = (role: string | null) => {
    if (role === 'citizen') return <User className="w-16 h-16 text-blue-400" />;
    if (role === 'spy') return <Ghost className="w-16 h-16 text-red-400" />;
    if (role === 'white') return <HatGlasses className="w-16 h-16 text-slate-300" />;
    return null;
  };

  const getRoleName = (role: string | null) => {
    if (role === 'citizen') return 'DÂN THƯỜNG';
    if (role === 'spy') return 'GIÁN ĐIỆP';
    if (role === 'white') return 'MŨ TRẮNG';
    return 'KHÔNG RÕ';
  };

  const getRoleColor = (role: string | null) => {
    if (role === 'citizen') return 'text-blue-400';
    if (role === 'spy') return 'text-red-400';
    if (role === 'white') return 'text-slate-300';
    return 'text-white';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 md:p-8">
      
      <div className="text-center mb-8 mt-8 animate-fade-in-up">
        <h2 className="text-4xl font-black text-white tracking-widest mb-2">KẾT QUẢ</h2>
        <p className="text-slate-400">Vòng bỏ phiếu thứ {room.currentRound}</p>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">
        {!eliminatedPlayer ? (
          <Card className="w-full bg-slate-900 border-slate-800 p-8 text-center shadow-2xl animate-fade-in-up">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">HOÀ PHIẾU</h3>
            <p className="text-slate-400">Không có ai bị loại trong vòng này!</p>
          </Card>
        ) : (
          <div className="w-full relative min-h-[350px]">
            {/* Suspense State */}
            <Card className={`absolute inset-0 w-full bg-slate-900 border-red-500/30 p-8 text-center shadow-2xl shadow-red-500/10 transition-all duration-1000 flex flex-col items-center justify-center ${isRevealing ? 'opacity-100 z-10 scale-100' : 'opacity-0 -z-10 scale-95'}`}>
              <div className="animate-pulse flex flex-col items-center">
                <Skull className="w-20 h-20 text-red-500 mb-6" />
                <h3 className="text-2xl font-bold text-slate-300 mb-2">Người bị loại là...</h3>
                <p className="text-4xl font-black text-white">{eliminatedPlayer.name}</p>
              </div>
            </Card>

            {/* Reveal State */}
            <Card className={`w-full bg-slate-900 border-slate-700 p-8 text-center shadow-2xl transition-all duration-1000 flex flex-col items-center justify-center ${!isRevealing ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <Avatar className="h-24 w-24 border-4 border-slate-800 mb-6 mx-auto">
                <AvatarFallback className="bg-slate-800 text-slate-300 text-2xl">
                  {eliminatedPlayer.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-3xl font-black text-white mb-6">{eliminatedPlayer.name}</h3>
              
              <div className="space-y-4 w-full">
                <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Vai trò thật sự</p>
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center gap-4">
                  <div className="animate-bounce">
                    {getRoleIcon(eliminatedPlayer.role)}
                  </div>
                  <p className={`text-3xl font-black ${getRoleColor(eliminatedPlayer.role)}`}>
                    {getRoleName(eliminatedPlayer.role)}
                  </p>
                </div>
              </div>

              {eliminatedPlayer.role === 'white' && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 font-semibold text-sm">
                    ⚠️ Mũ Trắng đã bị loại! Họ sẽ có cơ hội cuối cùng để đoán từ khoá.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-12 mb-8">
        {isHost ? (
          <Button 
            onClick={handleNext}
            className="w-full h-14 text-lg font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-xl"
          >
            Tiếp tục <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <div className="text-center p-4">
            <p className="text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Chờ chủ phòng tiếp tục...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
