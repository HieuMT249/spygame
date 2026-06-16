"use client";

import { useState } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { handleWhiteHatGuess, advanceGameAfterElimination } from '@/services/roomService';
import { HelpCircle, Send, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

export const WhiteHatGuessScreen = () => {
  const { room, players, isHost, currentPlayer } = useGameContext();
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room) return null;

  const eliminatedPlayer = players.find(p => p.id === room.eliminatedPlayerId);
  const isEliminated = currentPlayer?.id === room.eliminatedPlayerId;

  const handleSubmit = async () => {
    if (!guess.trim()) return;
    try {
      setIsSubmitting(true);
      const correct = await handleWhiteHatGuess(room.id, guess, room.citizenWord);
      if (!correct) {
        toast.error('Đoán sai! Game tiếp tục...');
        await advanceGameAfterElimination(room.id);
      }
      // Nếu đúng thì room.status tự chuyển sang "finished"
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      await advanceGameAfterElimination(room.id);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800 rounded-full p-5 border-2 border-slate-600 shadow-xl shadow-slate-900">
              <HelpCircle className="w-12 h-12 text-slate-300" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">CƠ HỘI CUỐI CÙNG</h2>
          <p className="text-slate-400">
            <span className="text-slate-200 font-semibold">{eliminatedPlayer?.name}</span> là Mũ Trắng!
          </p>
          <p className="text-slate-500 text-sm mt-1">Đoán đúng từ khoá của Dân Thường để chiến thắng.</p>
        </div>

        {/* Input / Waiting */}
        {isEliminated ? (
          <Card className="bg-slate-900 border-slate-700 p-6 space-y-4">
            <p className="text-slate-300 text-center font-medium">
              Bạn là Mũ Trắng. Hãy đoán từ khoá của Dân Thường!
            </p>
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Nhập từ khoá bạn đoán..."
              className="bg-slate-950 border-slate-700 text-white text-lg h-12 text-center placeholder:text-slate-600 focus-visible:ring-slate-400"
              disabled={isSubmitting}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!guess.trim() || isSubmitting}
              className="w-full h-12 text-base font-bold bg-slate-100 text-slate-950 hover:bg-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Xác nhận đoán
            </Button>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-700 p-8 text-center space-y-4">
            <div className="flex justify-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            </div>
            <p className="text-slate-300 font-medium">
              Đang chờ <span className="text-white font-bold">{eliminatedPlayer?.name}</span> đoán từ khoá...
            </p>
            {isHost && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Bỏ qua (Host)
              </Button>
            )}
          </Card>
        )}

        {/* Hint */}
        <p className="text-center text-slate-600 text-xs">
          Mũ Trắng không biết từ khoá của bất kỳ ai. Hãy dựa vào những gì đã nghe trong thảo luận!
        </p>
      </div>
    </div>
  );
};
