# 🕵️ Ai Là Gián Điệp

Web game multiplayer realtime **Who is the Spy** xây dựng với Next.js 15, TypeScript, TailwindCSS, và Firebase Firestore.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (Strict mode)
- **TailwindCSS v4**
- **shadcn/ui**
- **Firebase Firestore** (Realtime)

## Game Flow

```
Lobby → Xem thẻ → Bỏ phiếu → Kết quả → [Mũ Trắng đoán] → Kết thúc
```

### Vai trò
| Vai trò | Mô tả |
|---|---|
| 🧑 Dân Thường | Biết từ khoá, tìm và loại Gián Điệp |
| 👻 Gián Điệp | Không biết từ khoá, giả vờ là Dân Thường |
| 🎩 Mũ Trắng | Không biết từ khoá của ai, đoán đúng để thắng |

### Điều kiện thắng
- **Dân Thường**: Loại hết Gián Điệp
- **Gián Điệp**: Số Gián Điệp ≥ Dân Thường còn lại
- **Mũ Trắng**: Bị loại và đoán đúng từ khoá Dân Thường

## Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/HieuMT249/spygame.git
cd spygame
npm install
```

### 2. Cấu hình Firebase

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Điền Firebase config vào `.env.local` (lấy từ Firebase Console → Project Settings → Your apps).

**Firestore Security Rules** (dùng cho dev):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Deploy lên Vercel

```bash
npm install -g vercel
vercel
```

Thêm các biến môi trường trong Vercel Dashboard → Settings → Environment Variables.

## Cách chơi

1. Người chơi 1 tạo phòng, chia sẻ mã 6 ký tự
2. Mọi người join bằng mã phòng (tối thiểu 4 người)
3. Host bấm **Bắt Đầu Game**
4. Mỗi người bấm **Xem thẻ** để biết vai trò và từ khoá của mình
5. Thảo luận trực tiếp (offline) rồi bỏ phiếu loại người bị nghi ngờ
6. Game tiếp tục đến khi có phe thắng