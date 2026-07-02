# Realistik Dizayn va Tabiiy Ovoz Tizimi

Ushbu reja saytdagi barcha qolgan emoji belgilarni professional, realistik va zamonaviy SVG grafikalar hamda kitob muqovalari bilan almashtirish, shuningdek, audio eshitish bo'limidagi robot ovozini tabiiy inson ovoziga (Google Neural TTS) o'tkazishni ta'minlaydi.

## User Review Required

> [!IMPORTANT]
> **Audio Tizimini O'zgartirish**: Brauzerning standart `SpeechSynthesis` ovoz berish tizimi o'zbek tili uchun harflarni bittalab o'qib (spelling out) juda noo'rin ishlar edi. Yangi tizim matnni gaplarga bo'lib, Google Translate'ning yuqori sifatli o'zbekcha ovozi orqali o'qiydi. Bu tabiiy, ravon va xuddi odam o'qiyotganday eshitiladi. Tarmoq xatosi yoki bloklanish holatlarida standart tizim avtomatik ravishda zaxira (fallback) bo'lib ishlaydi.

## Proposed Changes

### 1. UI Emojilarini Realistik SVG bilan Almashtirish (`index.html`)

Barcha emojilarni professional inline SVG belgilarga almashtiramiz:
- **Navbar logo va footer logo**: `📚` belgisi o'rniga zamonaviy oqish nurli kitob SVG ramzi.
- **Navbar link**: `🎧 Audio` o'rniga naushnik SVG belgisi.
- **Hero nishonlar va tugmalar**: `✨`, `🚀`, `🎯` belgilari o'rniga mos ravishda yulduzcha, raketa va nishon SVG'lari.
- **Section Tags**: Barcha bo'lim sarlavhalari tepasidagi emojilar (masalan, `🌟 Afzalliklar`, `📖 Janrlar`, `💡 Maslahatlar`) yaltiroq, rangli inline SVG ramzlar bilan almashtiriladi.
- **FAQ ro'yxati**: Savollar boshidagi `📌` emojilari o'rniga aylanali savol belgisi (help circle) SVG o'rnatiladi.
- **Ovoz boshqaruv paneli**: `🗣` va `📢` belgilari o'rniga inson profili va dinamik balandlik SVG piktogrammalari o'rnatiladi.

### 2. Audio Bo'limi va Ovoz Realizatsiyasi (`app.js`)

#### [MODIFY] [app.js](file:///C:/Users/Acer/Desktop/my-project/kitob-olami/app.js)
- `BOOKS` ro'yxatidagi emojilarni olib tashlash va ularga muqova rasmlarini (`cover`) bog'lash:
  - Alkimyogar: `genre_philosophy.png`
  - Sapiens: `genre_science.png`
  - Kichkina Shahzoda: `genre_fantasy.png`
  - O'tkan Kunlar: `hero_book.png`
- `renderBook(idx)` funksiyasida emoji matnini chiqarish o'rniga kitobning haqiqiy muqova rasmini (`<img>` shaklida) chiqarish.
- Ovoz eshittirish tizimini yangilash:
  - Matnni gaplarga bo'luvchi funksiya yozish.
  - Gaplarni Google Translate TTS API yordamida yuklash va ijro etish.
  - Har bir gap ijro etilganda, audio vaqti va gapdagi so'zlar uzunligiga qarab, so'zlarni silliq va o'ta aniqlikda bo'yab borish (word highlight).
  - Audio tugaganda navbatdagi gapga avtomatik o'tish.
  - Tarmoq yoki Google xizmati ishlamasa, brauzerning ichki `SpeechSynthesis` tizimiga o'tuvchi avtomatik zaxira (fallback) tizimini qo'shish.
- Viktorina (`quizData`) va Viktorina natijalaridagi emojilarni JavaScript ichida dinamik ravishda o'ta premium SVG render funksiyalariga o'tkazish.

## Verification Plan

### Manual Verification
1. Saytni ochib, navigatsiya, bo'limlar va footerda hech qanday emoji qolmaganini tekshirish.
2. Audio bo'limiga o'tib, kitoblar muqovasi emojilar emas, balki real tasvirlar ekanligini ko'rish.
3. Audio ijrosini boshlash, ovozning ravon va tabiiy o'zbekchada (so'zlarni bo'g'inlab, to'g'ri talaffuz bilan) o'qiyotganini hamda so'zlar aytilishiga mos ravishda silliq bo'yab borilayotganini tekshirish.
4. Ovoz tezligi va balandligini o'zgartirib ko'rish.
5. Viktorina savollarida va natijalarida SVG rasmlar to'g'ri chiqishini tasdiqlash.
