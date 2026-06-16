"use client";

import { useState, useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useVotes } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { addVote } from '@/lib/firebase/votes';
import { processVotes } from '@/services/roomService';
import { toast } from 'sonner';
import { Users, AlertCircle, Check, Hash } from 'lucide-react';

export const VotingScreen = () => {
  const { room, players, currentPlayer, isHost } = useGameContext();
  const { votes } = useVotes(room?.id || null, room?.currentRound || 1);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room || !currentPlayer) return null;

  const alivePlayers = players.filter(p => p.alive);
  const amIAlive = currentPlayer.alive;
  const isAllVoted = votes.length === alivePlayers.length;

  // Thứ tự random từ room.turnOrder
  const turnOrder: string[] = room.turnOrder ?? [];
  const orderedPlayers = turnOrder
    .map(id => alivePlayers.find(p => p.id === id))
    .filter(Boolean) as typeof alivePlayers;
  // Fallback nếu turnOrder chưa sync
  const displayPlayers = orderedPlayers.length > 0 ? orderedPlayers : alivePlayers;

  useEffect(() => {
    setHasVoted(votes.some(v => v.voterId === currentPlayer.id));
  }, [votes, currentPlayer.id]);

  // Reset selected khi votes bị xóa (hoà phiếu → vote lại)
  useEffect(() => {
    if (votes.length === 0) {
      setHasVoted(false);
      setSelectedPlayerId(null);
      setIsSubmitting(false);
    }
  }, [votes.length]);

  const handleVote = async () => {
    if (!selectedPlayerId) return;
    try {
      setIsSubmitting(true);
      await addVote(room.id, {
        voterId: currentPlayer.id,
        targetId: selectedPlayerId,
        round: room.currentRound,
      });
      setHasVoted(true);
      toast.success('Đã ghi nhận phiếu bầu!');
    } catch {
      toast.error('Lỗi khi bỏ phiếu');
      setIsSubmitting(false);
    }
  };

  const handleProcessResult = async () => {
    try {
      const { eliminatedPlayer } = await processVotes(room.id, room.currentRound);
      if (!eliminatedPlayer) {
        // Hoà phiếu — votes đã bị xóa, UI tự reset qua useEffect
        toast.warning('Hoà phiếu! Bỏ phiếu lại.');
      }
    } catch {
      toast.error('Lỗi khi xử lý kết quả');
    }
  };

  // Auto xử lý khi đủ phiếu (Host only)
  useEffect(() => {
    if (isHost && isAllVoted && votes.length > 0 && room.status === 'voting') {
      const timer = setTimeout(() => {
        handleProcessResult();
      }, 2000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, isAllVoted, votes.length, room.status, room.currentRound]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6 mt-4 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 flex items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          BỎ PHIẾU VÒNG {room.currentRound}
        </h2>
        <p className="text-slate-400 mt-2">
          Hãy chọn ra người mà bạn nghi ngờ là Gián Điệp hoặc Mũ Trắng!
        </p>
      </div>

      {/* Thứ tự vòng này */}
      {turnOrder.length > 0 && (
        <div className="mb-5 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Thứ tự vòng này
          </p>
          <div className="flex flex-wrap gap-2">
            {turnOrder.map((id, idx) => {
              const p = players.find(pl => pl.id === id);
              if (!p) return null;
              const isMe = p.id === currentPlayer.id;
              return (
                <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                  isMe
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  <span className="text-slate-500 text-xs font-mono">{idx + 1}.</span>
                  {p.name}{isMe && ' (Bạn)'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-5 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-400" />
          <span className="text-slate-300 font-medium">Tiến độ bỏ phiếu</span>
        </div>
        <div className="text-xl font-bold font-mono">
          <span className={isAllVoted ? "text-green-400" : "text-blue-400"}>{votes.length}</span>
          <span className="text-slate-500">/{alivePlayers.length}</span>
        </div>
      </div>

      {/* Player grid */}
      <div className="flex-1 overflow-y-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayPlayers.map((player) => {
            const isMe = player.id === currentPlayer.id;
            const isSelected = selectedPlayerId === player.id;
            const hasThisPlayerVoted = votes.some(v => v.voterId === player.id);

            return (
              <Card
                key={player.id}
                onClick={() => {
                  if (!hasVoted && amIAlive && !isMe) {
                    setSelectedPlayerId(player.id);
                  }
                }}
                className={`relative overflow-hidden transition-all duration-200 ${
                  !amIAlive || hasVoted || isMe
                    ? 'opacity-80 cursor-not-allowed bg-slate-900/50 border-slate-800'
                    : 'cursor-pointer hover:bg-slate-800 border-slate-700'
                } ${isSelected ? 'ring-2 ring-red-500 bg-red-500/10 border-red-500/50 scale-[1.02]' : ''}`}
              >
                <div className="p-6 flex flex-col items-center text-center gap-3">
                  <Avatar className={`h-16 w-16 border-2 ${isSelected ? 'border-red-500' : 'border-slate-700'}`}>
                    <AvatarFallback className="bg-slate-800 text-slate-300 text-lg">
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-200">{player.name}</p>
                    {isMe && <p className="text-xs text-blue-400 mt-1">(Bạn)</p>}
                  </div>
                  <div className="absolute top-2 right-2">
                    {hasThisPlayerVoted ? (
                      <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã vote
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-slate-500 text-xs px-2 py-1 rounded">
                        Chưa vote
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 pb-4 pt-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        {amIAlive && !hasVoted ? (
          <Button
            onClick={handleVote}
            disabled={!selectedPlayerId || isSubmitting}
            className={`w-full h-14 text-lg font-bold shadow-xl transition-all ${
              selectedPlayerId
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/25'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {selectedPlayerId ? 'Chốt Phiếu Bầu' : 'Chọn một người để loại'}
          </Button>
        ) : (
          <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-300 flex items-center justify-center gap-2">
              {isAllVoted ? (
                <span className="text-green-400 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Đã đủ phiếu! Đang xử lý...
                </span>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  {amIAlive ? 'Đã bỏ phiếu. ' : 'Bạn đã bị loại. '}Đang đợi những người khác...
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};