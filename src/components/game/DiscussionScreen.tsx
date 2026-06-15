"use client";

import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { advanceSpeaker } from '@/services/roomService';
import { Mic, CheckCircle2, ChevronRight, Skull } from 'lucide-react';
import { toast } from 'sonner';

export const DiscussionScreen = () => {
  const { room, players, currentPlayer, isHost } = useGameContext();

  if (!room || !currentPlayer) return null;

  // Lọc ra danh sách những người còn sống
  const alivePlayers = players.filter(p => p.alive).sort((a, b) => a.speakingOrder - b.speakingOrder);
  const currentSpeaker = alivePlayers[room.currentSpeakerIndex];

  const handleNextSpeaker = async () => {
    try {
      await advanceSpeaker(room.id, room.currentSpeakerIndex, alivePlayers.length);
    } catch (error: any) {
      toast.error('Lỗi khi chuyển người nói');
    }
  };

  const isMyTurn = currentSpeaker?.id === currentPlayer.id;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8 mt-4 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          THẢO LUẬN VÒNG {room.currentRound}
        </h2>
        <p className="text-slate-400 mt-2">
          Mỗi người hãy miêu tả từ khoá của mình mà không nói thẳng ra!
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-8 custom-scrollbar">
        {alivePlayers.map((player, index) => {
          const isSpeaking = index === room.currentSpeakerIndex;
          const hasSpoken = index < room.currentSpeakerIndex;

          return (
            <Card 
              key={player.id}
              className={`p-4 transition-all duration-300 border-2 ${
                isSpeaking 
                  ? 'bg-slate-900 border-blue-500 scale-[1.02] shadow-lg shadow-blue-500/20' 
                  : hasSpoken
                    ? 'bg-slate-950 border-slate-800 opacity-60'
                    : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className={`h-12 w-12 border-2 ${isSpeaking ? 'border-blue-400' : 'border-slate-700'}`}>
                    <AvatarFallback className={isSpeaking ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-300'}>
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border border-slate-900 animate-pulse">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {hasSpoken && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border border-slate-900">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-lg truncate ${isSpeaking ? 'text-blue-400' : 'text-slate-200'}`}>
                      {player.name} {player.id === currentPlayer.id && "(Bạn)"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {isSpeaking ? "Đang phát biểu..." : hasSpoken ? "Đã xong" : "Chờ tới lượt"}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
        
        {/* Dead players section */}
        {players.some(p => !p.alive) && (
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Skull className="w-4 h-4" /> Đã Bị Loại
            </h3>
            <div className="flex flex-wrap gap-2">
              {players.filter(p => !p.alive).map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-slate-900/50 border border-red-900/30 text-slate-500 px-3 py-1.5 rounded-full text-sm">
                  <span className="line-through">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 pb-4 pt-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        {isHost ? (
          <Button 
            onClick={handleNextSpeaker}
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
          >
            {room.currentSpeakerIndex >= alivePlayers.length - 1 ? (
              "Kết thúc Thảo luận & Bỏ phiếu"
            ) : (
              <>Chuyển lượt cho {alivePlayers[room.currentSpeakerIndex + 1]?.name} <ChevronRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        ) : (
          <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-300">
              {isMyTurn ? (
                <span className="text-blue-400 font-semibold animate-pulse flex items-center justify-center gap-2">
                  <Mic className="w-4 h-4" /> Tới lượt bạn! Hãy nói gì đó...
                </span>
              ) : (
                "Chủ phòng điều khiển lượt nói..."
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
