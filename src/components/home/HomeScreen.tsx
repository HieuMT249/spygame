"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGameActions } from '@/hooks/useGameActions';
import { toast } from 'sonner';
import { Ghost, Users, HelpCircle, X, User, Shield, Trophy, HatGlasses } from 'lucide-react';
import Image from 'next/image';
import images from '@/app/images';

// ── Rules Modal ───────────────────────────────────────────────────────────────

const RulesModal = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in-up"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h2 className="text-xl font-black text-white">Luật Chơi</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* Mục tiêu */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Mục tiêu</h3>
          <p className="text-slate-300 leading-relaxed">
            Mỗi người chơi nhận một <span className="text-white font-semibold">từ khoá bí mật</span>.
            Dân Thường cùng từ, Gián Điệp từ khác, Mũ Trắng không biết gì.
            Thảo luận, tìm ra ai là Gián Điệp và bỏ phiếu loại họ!
          </p>
        </section>

        {/* Vai trò */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Vai trò</h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="shrink-0 w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-400">Dân Thường</p>
                <p className="text-slate-400 text-sm">Biết từ khoá. Thảo luận để tìm Gián Điệp mà không lộ từ khoá.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="shrink-0 w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
                <Ghost className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-400">Gián Điệp</p>
                <p className="text-slate-400 text-sm">Biết từ khác. Giả vờ là Dân Thường, tránh bị phát hiện.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
              <div className="shrink-0 w-9 h-9 rounded-full bg-slate-500/20 flex items-center justify-center">
                <HatGlasses className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-300">Mũ Trắng</p>
                <p className="text-slate-400 text-sm">Không biết từ khoá của ai. Nghe thảo luận và đoán từ khoá Dân Thường khi bị loại.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Luật số người */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Phân bổ vai trò</h3>
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60">
                  <th className="text-left p-3 text-slate-400 font-medium">Số người</th>
                  <th className="text-center p-3 text-red-400 font-medium">Gián Điệp</th>
                  <th className="text-center p-3 text-slate-300 font-medium">Mũ Trắng</th>
                  <th className="text-center p-3 text-blue-400 font-medium">Dân Thường</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  { range: '4 – 6', spy: 1, white: 1, citizen: '2 – 4' },
                  { range: '7 – 9', spy: 2, white: 1, citizen: '4 – 6' },
                  { range: '10+',   spy: 3, white: 1, citizen: '6+' },
                ].map((row) => (
                  <tr key={row.range} className="bg-slate-900/40">
                    <td className="p-3 text-slate-300 font-medium">{row.range}</td>
                    <td className="p-3 text-center text-slate-300">{row.spy}</td>
                    <td className="p-3 text-center text-slate-300">{row.white}</td>
                    <td className="p-3 text-center text-slate-300">{row.citizen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Điều kiện thắng */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Điều kiện thắng</h3>
          <div className="space-y-2">
            {[
              { icon: <User className="w-4 h-4 text-blue-400" />, color: 'text-blue-400', label: 'Dân Thường thắng', desc: 'khi loại hết Gián Điệp' },
              { icon: <Ghost className="w-4 h-4 text-red-400" />, color: 'text-red-400', label: 'Gián Điệp thắng', desc: 'khi số Gián Điệp ≥ Dân Thường còn lại' },
              { icon: <HatGlasses className="w-4 h-4 text-slate-300" />, color: 'text-slate-300', label: 'Mũ Trắng thắng', desc: 'khi bị loại và đoán đúng từ khoá Dân Thường' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40">
                <div className="mt-0.5">{item.icon}</div>
                <p className="text-slate-300 text-sm">
                  <span className={`font-semibold ${item.color}`}>{item.label}</span> {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Lưu ý hoà phiếu */}
        <section className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex gap-2 items-start">
            <Shield className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-slate-300 text-sm">
              <span className="text-yellow-400 font-semibold">Hoà phiếu</span> — không ai bị loại, cả nhóm bỏ phiếu lại ngay vòng đó.
            </p>
          </div>
        </section>

      </div>
    </div>
  </div>
);

// ── HomeScreen ────────────────────────────────────────────────────────────────

export const HomeScreen = () => {
  const router = useRouter();
  const { createRoom, joinRoom } = useGameActions();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const hasRoomCode = roomCode.trim().length > 0;

  const handleCreateRoom = async () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên của bạn'); return; }
    if (name.trim().length > 30) { toast.error('Tên tối đa 30 ký tự. Vui lòng thử lại!'); return; }
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
    if (!name.trim()) { toast.error('Vui lòng nhập tên của bạn'); return; }
    if (name.trim().length > 30) { toast.error('Tên tối đa 30 ký tự. Vui lòng thử lại!'); return; }
    if (roomCode.length !== 6) { toast.error('Mã phòng phải có 6 ký tự'); return; }
    try {
      setIsLoading(true);
      const code = roomCode.toUpperCase();
      const { playerId } = await joinRoom(code, name);
      localStorage.setItem(`spy_game_player_${code}`, playerId);
      toast.success('Vào phòng thành công!');
      router.push(`/room/${code}`);
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Không thể tham gia phòng';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[100px]" />

        {/* Logo */}
        <div className="z-10 mb-2 text-center animate-fade-in-up">
          <div className="flex justify-center">
            <div className="relative">
              {/* <Ghost className="w-16 h-16 text-slate-100" />
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 border-2 border-slate-950">
                <Users className="w-4 h-4 text-white" />
              </div> */}
              <Image alt={"logo"} src={images.logo} className="w-38 h-38"/>
            </div>
          </div>
          <div className="flex">
            <h1 className="text-3xl md:text-4xl font-black mr-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-500-300 to-green-300 mb-2">
              AI LÀ 
            </h1> 
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-300 to-orange-300 mb-2">
               GIÁN ĐIỆP
            </h1>
          </div>
          <p className="text-slate-400 font-medium tracking-wide">Who is the Spy?</p>
        </div>

        {/* Card */}
        <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800 text-slate-100 z-10 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Bắt Đầu</CardTitle>
              <button
                onClick={() => setShowRules(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-slate-700 hover:border-slate-600"
              >
                <HelpCircle className="w-4 h-4" />
                Luật chơi
              </button>
            </div>
            <CardDescription className="text-slate-400">
              Nhập tên của bạn để tạo hoặc tham gia phòng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Tên người chơi</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Minh Hiếu, HieuMT, ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (hasRoomCode ? handleJoinRoom() : handleCreateRoom())}
                className="bg-slate-950/50 border-slate-800 text-lg h-12 placeholder:text-slate-600 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-slate-300">
                Mã phòng <span className="text-slate-500 font-normal">(để trống nếu muốn tạo phòng mới)</span>
              </Label>
              <Input
                id="roomCode"
                placeholder="ABCDEF"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="bg-slate-950/50 border-slate-800 text-lg h-12 text-center tracking-widest uppercase placeholder:text-slate-600 focus-visible:ring-slate-400"
                maxLength={6}
              />
            </div>

            {hasRoomCode ? (
              <Button
                onClick={handleJoinRoom}
                disabled={isLoading || roomCode.length !== 6}
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-500 text-white"
              >
                Tham Gia Phòng
              </Button>
            ) : (
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
              >
                Tạo Phòng Mới
              </Button>
            )}

          </CardContent>
        </Card>
        <div className="text-sm italic text-blue-500 mt-12">Product by HieuMT</div>
      </div>
    </>
  );
};