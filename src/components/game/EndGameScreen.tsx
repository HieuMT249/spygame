"use client";

import { useEffect, useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { resetRoom } from '@/services/roomService';
import { Ghost, User, HelpCircle, Trophy, RotateCcw, Crown } from 'lucide-react';
import { toast } from 'sonner';
import type { PlayerRole } from '@/types/game';

const WINNER_CONFIG = {
  citizen: {
    label: 'DÂN THƯỜNG CHIẾN THẮNG!',
    sublabel: 'Các Gián Điệp đã bị loại khỏi làng.',
    gradient: 'from-blue-600 to-teal-500',
    glow: 'shadow-blue-500/30',
    icon: <User className="w-16 h-16 text-white" />,
  },
  spy: {
    label: 'GIÁN ĐIỆP CHIẾN THẮNG!',
    sublabel: 'Gián Điệp đã kiểm soát làng.',
    gradient: 'from-red-600 to-orange-500',
    glow: 'shadow-red-500/30',
    icon: <Ghost className="w-16 h-16 text-white" />,
  },
  white: {
    label: 'MŨ TRẮNG CHIẾN THẮNG!',
    sublabel: 'Mũ Trắng đã đoán đúng từ khoá bí mật!',
    gradient: 'from-slate-500 to-slate-300',
    glow: 'shadow-slate-400/30',
    icon: <HelpCircle className="w-16 h-16 text-white" />,
  },
};

const ROLE_STYLE: Record<PlayerRole, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  citizen: {
    label: 'Dân Thường',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: <User className="w-4 h-4" />,
  },
  spy: {
    label: 'Gián Điệp',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: <Ghost className="w-4 h-4" />,
  },
  white: {
    label: 'Mũ Trắng',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10 border-slate-500/20',
    icon: <HelpCircle className="w-4 h-4" />,
  },
};

export const EndGameScreen = () => {
  const { room, players, isHost, currentPlayer } = useGameContext();
  const [isResetting, setIsResetting] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPlayers(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!room || !room.winner) return null;

  const config = WINNER_CONFIG[room.winner];
  const myWinnerRole: PlayerRole | null = currentPlayer?.role ?? null;
  const iWon =
    myWinnerRole === room.winner ||
    (room.winner === 'citizen' && myWinnerRole === 'white' && false); // white thắng riêng

  const handlePlayAgain = async () => {
    try {
      setIsResetting(true);
      await resetRoom(room.id);
    } catch {
      toast.error('Lỗi khi reset phòng');
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 pb-8">

      {/* Winner Banner */}
      <div className={`w-full max-w-md mt-8 mb-6 rounded-3xl bg-gradient-to-br ${config.gradient} shadow-2xl ${config.glow} p-8 text-center animate-fade-in-up`}>
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 rounded-full p-5 backdrop-blur-sm">
            {config.icon}
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
          {config.label}
        </h1>
        <p className="text-white/80 text-sm">{config.sublabel}</p>

        {iWon && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-white font-semibold text-sm">
            <Trophy className="w-4 h-4" /> Bạn thắng rồi!
          </div>
        )}
      </div>

      {/* Word Reveal */}
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-5 mb-6 animate-fade-in-up">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Từ khoá vòng này</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-400 font-medium mb-1">Dân Thường</p>
            <p className="text-xl font-black text-white">{room.citizenWord}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-xs text-red-400 font-medium mb-1">Gián Điệp</p>
            <p className="text-xl font-black text-white">{room.spyWord}</p>
          </div>
        </div>
      </Card>

      {/* Player Roles */}
      <div className="w-full max-w-md mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 px-1">
          Danh sách người chơi
        </p>
        <div className={`space-y-2 transition-all duration-700 ${showPlayers ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          {players
            .sort((a, b) => {
              // Sort: winners first, then by role
              const order: Record<string, number> = { spy: 0, white: 1, citizen: 2 };
              return (order[a.role ?? 'citizen'] ?? 3) - (order[b.role ?? 'citizen'] ?? 3);
            })
            .map((player) => {
              const role = player.role as PlayerRole;
              const style = ROLE_STYLE[role] ?? ROLE_STYLE.citizen;
              const isMe = player.id === currentPlayer?.id;
              const isHostPlayer = player.id === room.hostId;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${style.bg} transition-all`}
                >
                  <Avatar className="h-10 w-10 border border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-slate-300 text-sm">
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-200 truncate">
                        {player.name}
                        {isMe && <span className="text-blue-400 ml-1 text-sm font-normal">(Bạn)</span>}
                      </p>
                      {isHostPlayer && <Crown className="w-3 h-3 text-yellow-500 shrink-0" />}
                      {!player.alive && <span className="text-xs text-slate-600 shrink-0">☠️</span>}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${style.color}`}>
                      {style.icon}
                      {style.label}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md">
        {isHost ? (
          <Button
            onClick={handlePlayAgain}
            disabled={isResetting}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-xl shadow-blue-500/25"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Chơi Lại
          </Button>
        ) : (
          <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Chờ chủ phòng bắt đầu ván mới...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
