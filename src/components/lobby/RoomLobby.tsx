"use client";

import { useGameContext } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Users, Crown, Check, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { startGame, disbandRoom } from '@/services/roomService';

export const RoomLobby = () => {
  const { room, players, isHost, currentPlayer } = useGameContext();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);

  if (!room) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    toast.success('Đã copy mã phòng!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/room/${room.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Đã copy link mời!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartGame = async () => {
    if (players.length < 4) {
      toast.error('Cần ít nhất 4 người chơi để bắt đầu!');
      return;
    }
    try {
      await startGame(room.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi khi bắt đầu game';
      toast.error(msg);
    }
  };

  const handleDisband = async () => {
    if (!confirmDisband) {
      setConfirmDisband(true);
      setTimeout(() => setConfirmDisband(false), 3000);
      return;
    }
    try {
      setIsDisbanding(true);
      await disbandRoom(room.id);
      toast.success('Đã giải tán phòng');
      router.push('/');
    } catch (error) {
      toast.error('Lỗi khi giải tán phòng');
      setIsDisbanding(false);
      setConfirmDisband(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col max-w-4xl mx-auto">
      <div className="flex-1 space-y-8">
        
        {/* Header & Code */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            PHÒNG CHỜ
          </h1>
          
          <div className="inline-block bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Mã phòng của bạn</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl md:text-7xl font-mono font-bold tracking-[0.25em] text-slate-100">
                {room.code}
              </span>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <Button 
                variant="outline" 
                className="bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-300"
                onClick={handleCopyCode}
              >
                {copiedCode ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Mã
              </Button>
              <Button 
                variant="outline" 
                className="bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-300"
                onClick={handleCopyLink}
              >
                {copiedLink ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        {/* Players List */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2 text-slate-200">
              <Users className="w-5 h-5 text-blue-400" />
              Người chơi
            </CardTitle>
            <div className="text-slate-400 font-medium">
              <span className={players.length >= 4 ? "text-green-400" : "text-yellow-400"}>
                {players.length}
              </span>
              <span>/15</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player) => (
                <div 
                  key={player.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    player.id === currentPlayer?.id 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-slate-950/50 border-slate-800/50'
                  } transition-all`}
                >
                  <Avatar className="h-10 w-10 border border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-slate-300">
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {player.name} {player.id === currentPlayer?.id && "(Bạn)"}
                    </p>
                    {player.id === room.hostId && (
                      <p className="text-xs text-yellow-500 flex items-center gap-1 font-medium mt-0.5">
                        <Crown className="w-3 h-3" /> Chủ phòng
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {players.length < 4 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                  <div className="animate-pulse w-8 h-8 rounded-full border-2 border-slate-700 border-t-transparent animate-spin mb-3" />
                  <p className="text-sm">Đang đợi thêm người chơi...</p>
                  <p className="text-xs mt-1">Cần tối thiểu {4 - players.length} người nữa để bắt đầu</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Footer / Start Button */}
      <div className="pt-8 pb-4 sticky bottom-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-t-0 z-10">
        {isHost ? (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleStartGame}
              disabled={players.length < 4}
              className={`w-full h-14 text-lg font-bold shadow-xl ${
                players.length >= 4
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Bắt Đầu Game
            </Button>
            <Button
              onClick={handleDisband}
              disabled={isDisbanding}
              variant="ghost"
              className={`w-full h-10 text-sm font-medium transition-all ${
                confirmDisband
                  ? 'text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                  : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {confirmDisband ? 'Bấm lần nữa để xác nhận giải tán' : 'Giải Tán Phòng'}
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Đang chờ chủ phòng bắt đầu...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};