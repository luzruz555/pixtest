# 🎨 Pixai Generator

LUZ 전용 Pixai 이미지 생성기

## ✨ 기능

- 🔑 API 키 저장 (브라우저 로컬 스토리지)
- 📝 기본 프롬프트 ON/OFF 및 수정
- 🚫 네거티브 프롬프트 수정
- 🎚️ LoRA 가중치 조절
- ⬇️ 이미지 다운로드
- 💎 Glassmorphism 디자인

## 🚀 Vercel 배포 방법

### 1. GitHub에 업로드

```bash
# 새 레포 생성 후
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/너의아이디/pixai-generator.git
git push -u origin main
```

### 2. Vercel 연결

1. [vercel.com](https://vercel.com) 로그인
2. **Add New** → **Project**
3. GitHub 레포 선택
4. **Deploy** 클릭
5. 끝! 🎉

## 🔧 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속

## 📁 구조

```
pixai-generator/
├── app/
│   ├── globals.css    # 스타일
│   ├── layout.tsx     # 레이아웃
│   └── page.tsx       # 메인 페이지
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 💜 Made for LUZ
