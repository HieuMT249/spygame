"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGameActions } from '@/hooks/useGameActions';
import { toast } from 'sonner';
import { Ghost, Users } from 'lucide-react';

export const HomeScreen = () => {
  const router = useRouter();
  const { createRoom, joinRoom } = useGameActions();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    
    try {
      setIsLoading(true);
      const { code, playerId } = await createRoom(name);
      localStorage.setItem(`spy_game_player_${code}`, playerId);
      toast.success('Tạo phòng thành công!');
      router.push(`/room/${code}`);
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tạo phòng');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên của bạn');
      return;
    }
    if (!roomCode.trim() || roomCode.length !== 6) {
      toast.error('Mã phòng phải có 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      const code = roomCode.toUpperCase();
      const { playerId } = await joinRoom(code, name);
      localStorage.setItem(`spy_game_player_${code}`, playerId);
      toast.success('Vào phòng thành công!');
      router.push(`/room/${code}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Không thể tham gia phòng');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[100px]" />
      
      <div className="z-10 mb-8 text-center animate-fade-in-up">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Ghost className="w-16 h-16 text-slate-100" />
            <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 border-2 border-slate-950">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-2">
          AI LÀ GIÁN ĐIỆP
        </h1>
        <p className="text-slate-400 font-medium tracking-wide">
          Who is the Spy?
        </p>
      </div>

      <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-100 z-10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Bắt Đầu</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Nhập tên của bạn để tạo hoặc tham gia phòng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Tên người chơi</Label>
            <Input 
              id="name" 
              placeholder="Ví dụ: Faker" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950/50 border-slate-800 text-lg h-12 placeholder:text-slate-600 focus-visible:ring-blue-500"
              maxLength={15}
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleCreateRoom} 
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
            >
              Tạo Phòng Mới
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Hoặc</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomCode" className="text-slate-300">Mã phòng (6 ký tự)</Label>
            <div className="flex gap-2">
              <Input 
                id="roomCode" 
                placeholder="ABCDEF" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-slate-950/50 border-slate-800 text-lg h-12 text-center tracking-widest uppercase placeholder:text-slate-600 focus-visible:ring-slate-400"
                maxLength={6}
              />
              <Button 
                onClick={handleJoinRoom} 
                disabled={isLoading || roomCode.length !== 6}
                variant="secondary"
                className="h-12 px-8 font-semibold bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                Tham Gia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
