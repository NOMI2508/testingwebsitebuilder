# 🛠️ AI Website Builder (Laguna M.1 + Mantine)

Ek Next.js app: **left side** aap apni website describe karte hain, **right side**
woh website **live** ban kar dikhti hai (React + Mantine). Aapko code nahi dekhna
padta — sirf natija. Baad mein keh sakte hain "button laal karo" aur woh update ho jata hai.

Ye **Poolside Laguna M.1 (free)** model use karta hai.

## ❓ Ye kaise kaam karta hai? (Lovable jaisa)

1. Aap chhota sa prompt likhte hain (misaal: "gym website").
2. **Step 1 — Samajhna:** `/api/enhance` pehle aapki requirement ko ek clear brief
   mein badalta hai (Purpose, Audience, Sections, Style, Content) — jo left panel
   par "📋 Maine ye samjha" mein dikhta hai.
3. **Step 2 — Banana:** `/api/generate` us brief se ek **proper component structure**
   wala React + Mantine page banata hai (Navbar, Hero, Features, Footer... alag components).
4. App us code ko iframe mein **live render** kar deti hai (React/Mantine/Babel CDN se).
   Isliye internet on hona chahiye.
5. Follow-up: "button laal karo" / "pricing add karo" — seedha update ho jata hai.

> Note (technical): routes OpenRouter ko Node ke built-in `https` se `family: 4`
> (IPv4) ke saath call karte hain — Node 20 ka default `fetch` is machine par IPv6
> par timeout ho jata tha ("fetch failed"). Ye `app/lib/openrouter.js` mein handle hai.

> Note: Poora Next.js project browser mein directly live nahi chal sakta (usay build
> chahiye). Isliye live preview ke liye model ek single React+Mantine component banata
> hai. "Download" button us component ka `App.jsx` de deta hai jise aap apne asli
> Next.js + Mantine project mein daal sakte hain.

## 🚀 Setup

```bash
npm install
cp .env.example .env.local      # phir .env.local mein apni key daalein
npm run dev
```
Browser: **http://localhost:3000**

API key free banayein: https://openrouter.ai/keys (`sk-or-...`)

## 📁 Files

| File | Kaam |
|------|------|
| `app/page.js` | Left prompt panel + right live preview (iframe) |
| `app/api/generate/route.js` | Server code + system prompt (model se React+Mantine component mangta hai) |
| `.env.local` | Aap ki secret API key |

## 🎨 Personality / rules badalni ho?
`app/api/generate/route.js` mein `systemPrompt` array edit karein.

## 🆓 Free tier
Free model par kabhi "rate limit" aa sakti hai — thoda ruk kar dubara try karein.
