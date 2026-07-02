// ===========================
// KITOB OLAMI — JavaScript
// ===========================

// ============================================================
// ===== AUDIO PLAYER — Web Speech API TTS =====
// ============================================================
const BOOKS = [
  {
    id: 0,
    cover: 'genre_philosophy.png',
    title: 'Alkimyogar',
    author: 'Paulo Koelo · 1988',
    tags: ['Falsafa', 'Bestseller', 'Motivatsiya'],
    excerpt: `Santiago yana tushini ko'rdi. Xuddi oldingi safar kabi — katta maydonda, qo'ylarini boqayotgan paytda bolakay uning yoniga kelib, uni Misr ehromlariga olib bordi.

"Agar u yerga borsang, yashirilgan xazinani topasan," dedi bolakay, va Santiago uyg'ondi.

Yigit o'z taqdiriga ishonmoqchi edi. Alkimyogar unga bir kuni aytgan edi: "Biron narsa xohlasang, butun koinot uni amalga oshirishga yordam beradi." 
Ko'nglida bitta narsani his qildi — bu safar u o'z Shaxsiy Afsonasini izlab yo'lga chiqishi kerak. Chunki har bir insonning o'z taqdiri bor, va uni izlash — eng katta jasorat.
Qo'ylarini qaradi. Ular tinch edi. Lekin Santiago endi tinch emas edi. Qalbi yurak urishi bilan birgalikda yangi bir hayotning boshlanishini his qildi.`,
    lang: 'uz-UZ',
    duration: 35
  },
  {
    id: 1,
    cover: 'genre_science.png',
    title: 'Sapiens — Insoniyat tarixi',
    author: 'Yuval Noah Harari · 2011',
    tags: ['Tarix', 'Fan', 'Bestseller'],
    excerpt: `Taxminan yuz ming yil avval, Yer yuzida kamida oltita inson turi yashagan. Bugun esa bittasi qolgan — biz. 

Homo Sapiens qanday qilib yagona inson turiga aylandi? Qanday qilib biz dunyoni zabt etdik, ulkan imperiyalar qurdik va oyga parvoz qildik?

Javob bitta so'zda — tasavvur. Boshqa hayvonlar faqat haqiqiy narsalarga ishonadi. Lekin biz? Biz mavjud bo'lmagan narsalarga ishona olamiz. Pul, davlat, din, korporatsiyalar — bularning barchasi faqat inson xayolida mavjud.

Mana shu tasavvur kuchi — yuz kishilik guruhdan milliardlik sivilizatsiyaga o'tishimizning siri. Biz o'zaro notanish odamlar bilan ham hamkorlik qila olamiz, chunki barchamiz bir xil afsonaga — bir xil "hayoliy voqelikka" ishonamiz.

Bu — Sapiens sirining eng chuqur qatlami.`,
    lang: 'uz-UZ',
    duration: 38
  },
  {
    id: 2,
    cover: 'genre_fantasy.png',
    title: 'Kichkina Shahzoda',
    author: 'Antoine de Saint-Exupéry · 1943',
    tags: ['Klassika', 'Falsafa', 'Klassika'],
    excerpt: `Men kattalar bilan hech qachon uzoq suhbatlasha olmasdim. Ular hech narsani tushunmasdi.

Kichkina shahzoda menga dedi: "Muhim narsalar ko'z bilan ko'rinmaydi. Faqat yurak bilan ko'rish mumkin."

Men bu so'zlarni bir umrga yodimga oldim.

U o'z sayyorasiga qaytmoqchi edi. U aytdi: "Yulduzlarni ko'rganda, shunday o'ylagin — ulardan biri mening sayyoram. Shunda men doim senga yaqin bo'laman. Va kular edim."

Men osmonga qaradim. Yulduzlar charaqlab turardi. Va birinchi marta — ularning barchasi kulyotganday tuyuldi. Shu kichkina shahzodaning kulishi kabi — mayda va go'zal.

Tilsimli bir narsa bu — do'stlik. Uning asli ko'rinmas.`,
    lang: 'uz-UZ',
    duration: 32
  },
  {
    id: 3,
    cover: 'hero_book.png',
    title: "O'tkan Kunlar",
    author: "Abdulla Qodiriy · 1925",
    tags: ["O'zbek klassikasi", 'Roman', 'Tarix'],
    excerpt: `Otabek otini Marg'ilon yo'liga surdi. Ko'ngli g'ash edi. Yuzlarga urilayotgan salqin shabada ham ko'nglini ochmas edi.

Kumushning yuzi ko'z o'ngida namoyon bo'ldi — oq, nafis, qizarib-bo'zarib turgan yuzlari. Va ko'zlari — oh, u ko'zlar! Dunyo yaralgandan buyon bunday ko'zlar bo'lganmikan?

"Uni sevaman," dedi u o'z-o'ziga. So'ng cho'chib ketdi. Bu so'zni aytishga haqqi bormi? Taqdir qanday ko'rsatadi — kim biladi?

Lekin yurak o'z yo'lini biladi. Otabek buni his qilardi. Tog' etaklaridan esayotgan shamol, ko'k osmon, ufqda bo'rtib chiqqan qor cho'qqilari — barchasi unga Kumushni eslatayotgandek edi.

Yo'l uzoq. Lekin ko'ngil uchun masofa yo'q.`,
    lang: 'uz-UZ',
    duration: 34
  }
];

// ---- TTS State ----
let sentenceAudio = null;
let currentSentenceIdx = 0;
let sentences = []; // array of sentence objects
let accumulatedDuration = 0;
let isFallbackActive = false;

let ttsPlaying  = false;
let ttsPaused   = false;
let currentBook = 0;
let ttsSpeed    = 1;
const speeds    = [0.75, 1, 1.25, 1.5, 1.75];
let speedIdx    = 1;

let elapsed = 0;
let totalEstimate = 0;

// ---- DOM refs (will be set after DOMContentLoaded) ----
let playBtn, playIcon, nowPlayingText, nowPlayingDot;
let elapsedEl, totalEl, progressFill;
let speedBtn, voiceSelect, volRange;
let waveformBars;
let audioSection;
let excerptTextEl;
let audioCoverEl, audioTitleEl, audioAuthorEl;

// ---- Build waveform bars ----
function buildWaveform() {
  const container = document.getElementById('waveform-bars');
  if (!container) return;
  container.innerHTML = '';
  const count = 60;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    bar.className = 'wbar';
    const hPct = 15 + Math.abs(Math.sin(i * 0.35)) * 65;
    bar.style.setProperty('--h', hPct + '%');
    bar.style.setProperty('--delay', (0.2 + (i % 12) * 0.07) + 's');
    bar.style.height = '15%';
    container.appendChild(bar);
  }
  waveformBars = container.querySelectorAll('.wbar');
}

// ---- Populate voices ----
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voiceSelect) return;
  voiceSelect.innerHTML = '';
  if (!voices.length) {
    voiceSelect.innerHTML = '<option value="">Brauzer ovozi</option>';
    return;
  }
  voices.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
  // Prefer Uzbek, then Russian, then English
  let pref = voices.findIndex(v => v.lang.toLowerCase().startsWith('uz'));
  if (pref === -1) {
    pref = voices.findIndex(v => v.lang.toLowerCase().startsWith('ru'));
  }
  if (pref === -1) {
    pref = voices.findIndex(v => v.lang.toLowerCase().startsWith('en'));
  }
  if (pref >= 0) voiceSelect.value = pref;
}

// ---- Helper: Split text into natural sentences ----
function splitIntoSentences(text) {
  const sentencesList = [];
  let currentSentence = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    currentSentence += char;
    
    const isPunct = (char === '.' || char === '!' || char === '?');
    if (isPunct) {
      if (i === text.length - 1 || /\s/.test(text[i+1])) {
        sentencesList.push(currentSentence.trim());
        currentSentence = "";
      } else if ((text[i+1] === '"' || text[i+1] === '\'' || text[i+1] === '”' || text[i+1] === '’') && 
                 (i === text.length - 2 || /\s/.test(text[i+2]))) {
        currentSentence += text[i+1];
        i++; // skip quote
        sentencesList.push(currentSentence.trim());
        currentSentence = "";
      }
    } else if (char === '\n') {
      if (currentSentence.trim()) {
        sentencesList.push(currentSentence.trim());
      }
      currentSentence = "";
    }
  }
  if (currentSentence.trim()) {
    sentencesList.push(currentSentence.trim());
  }
  return sentencesList.filter(s => s.length > 0);
}

// ---- Helper: Prepare Speech Sentences and Word Positions ----
function prepareSpeechData(excerpt) {
  const paragraphs = excerpt.split(/\n+/);
  let globalWordId = 0;
  sentences = [];
  
  paragraphs.forEach(para => {
    if (!para.trim()) return;
    const paraSentences = splitIntoSentences(para);
    
    paraSentences.forEach(sentenceText => {
      const words = sentenceText.split(/\s+/).filter(w => w.trim().length > 0);
      let searchStart = 0;
      const sentenceWords = [];
      
      words.forEach(w => {
        let start = sentenceText.indexOf(w, searchStart);
        if (start === -1) start = searchStart;
        const end = start + w.length;
        searchStart = end;
        
        sentenceWords.push({
          text: w,
          globalId: globalWordId++,
          startChar: start,
          endChar: end
        });
      });
      
      sentences.push({
        text: sentenceText,
        words: sentenceWords
      });
    });
  });
}

// ---- Render book ----
function renderBook(idx) {
  const b = BOOKS[idx];
  
  // Set cover as image (Realistic representation, not emoji)
  audioCoverEl.innerHTML = `<img src="${b.cover}" alt="${b.title}" class="audio-cover-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);" />`;
  audioCoverEl.style.background = 'none';
  audioTitleEl.textContent  = b.title;
  audioAuthorEl.textContent = b.author;

  // tags
  const tagsEl = document.querySelector('.audio-tags');
  if (tagsEl) {
    tagsEl.innerHTML = b.tags.map(t => `<span class="audio-tag">${t}</span>`).join('');
  }

  // Pre-process sentences and words mapping
  prepareSpeechData(b.excerpt);

  // Build the text excerpt HTML
  let html = '';
  let sentenceCounter = 0;
  
  const paragraphs = b.excerpt.split(/\n+/);
  html = paragraphs.map(para => {
    if (!para.trim()) return '';
    const paraSentences = splitIntoSentences(para);
    
    const paraHtml = paraSentences.map(sentenceText => {
      const sObj = sentences[sentenceCounter++];
      if (!sObj) return '';
      const wordsHtml = sObj.words.map(w => 
        `<span class="word" id="word-${w.globalId}">${w.text} </span>`
      ).join('');
      return `<span class="sentence-wrap">${wordsHtml}</span>`;
    }).join(' ');
    
    return `<p style="margin-bottom:12px; line-height: 1.7;">${paraHtml}</p>`;
  }).join('');

  excerptTextEl.innerHTML = html;

  totalEstimate = b.duration;
  elapsed = 0;
  updateProgress(0, totalEstimate);

  // update tabs
  document.querySelectorAll('.audio-tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
}

// ---- Play specific sentence index ----
function playSentence(index) {
  if (index >= sentences.length) {
    ttsStop();
    nowPlayingText.textContent = 'Tugatildi ✓';
    return;
  }
  
  currentSentenceIdx = index;
  const sentence = sentences[index];
  
  // Check if a native Uzbek voice is available in the dropdown
  const voicesList = speechSynthesis.getVoices();
  const selectedVoiceIdx = voiceSelect ? parseInt(voiceSelect.value) : -1;
  const selectedVoice = voicesList[selectedVoiceIdx];
  const isUzbekVoiceAvailable = selectedVoice && selectedVoice.lang.toLowerCase().startsWith('uz');
  
  if (isUzbekVoiceAvailable) {
    // Play using native SpeechSynthesis because it is a clear native Uzbek voice
    playSentenceNative(index, selectedVoice);
  } else {
    // Fallback to Google Neural TTS for a clear Uzbek voice stream
    playSentenceGoogleTTS(index);
  }
}

// ---- Play via Google TTS (client=gtx) ----
function playSentenceGoogleTTS(index) {
  const sentence = sentences[index];
  isFallbackActive = false;
  
  // Use client=gtx (usually has fewer referer/cors blocks on file:// protocol)
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=gtx&q=${encodeURIComponent(sentence.text)}`;
  
  if (sentenceAudio) {
    sentenceAudio.pause();
    sentenceAudio = null;
  }
  
  sentenceAudio = new Audio(url);
  sentenceAudio.playbackRate = speeds[speedIdx];
  sentenceAudio.volume = volRange ? parseFloat(volRange.value) : 1;
  
  const onPlayError = (err) => {
    console.warn("Google TTS client=gtx failed, trying client=tw-ob", err);
    playSentenceGoogleTTSAlternative(index);
  };
  
  sentenceAudio.addEventListener('loadedmetadata', () => {
    if (!ttsPlaying || ttsPaused) return;
    sentenceAudio.play().catch(onPlayError);
  });
  
  sentenceAudio.addEventListener('timeupdate', () => {
    if (!sentenceAudio || isFallbackActive) return;
    
    const curTime = sentenceAudio.currentTime;
    const duration = sentenceAudio.duration || 1;
    const pct = curTime / duration;
    
    // Proportional character highlighting
    const totalChars = sentence.text.length;
    const curCharPos = pct * totalChars;
    
    let activeWordGlobalId = -1;
    for (let i = 0; i < sentence.words.length; i++) {
      const wObj = sentence.words[i];
      if (curCharPos >= wObj.startChar && curCharPos <= wObj.endChar) {
        activeWordGlobalId = wObj.globalId;
        break;
      }
    }
    
    if (activeWordGlobalId === -1 && sentence.words.length > 0) {
      const idx = Math.min(Math.floor(pct * sentence.words.length), sentence.words.length - 1);
      activeWordGlobalId = sentence.words[idx].globalId;
    }
    
    excerptTextEl.querySelectorAll('.word').forEach(span => {
      span.classList.remove('word-highlight');
    });
    const activeSpan = document.getElementById(`word-${activeWordGlobalId}`);
    if (activeSpan) {
      activeSpan.classList.add('word-highlight');
      activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    
    const currentElapsed = accumulatedDuration + curTime;
    const totalWords = BOOKS[currentBook].excerpt.split(/\s+/).filter(w => w.trim().length > 0).length;
    const currentWordInSentence = sentence.words[0] ? sentence.words[0].globalId + Math.floor(pct * sentence.words.length) : 0;
    
    let estimatedTotal = totalEstimate;
    if (currentWordInSentence > 0) {
      const avgTimePerWord = currentElapsed / currentWordInSentence;
      estimatedTotal = currentElapsed + (totalWords - currentWordInSentence) * avgTimePerWord;
    }
    
    updateProgress(currentElapsed, estimatedTotal);
  });
  
  sentenceAudio.addEventListener('ended', () => {
    if (!ttsPlaying || ttsPaused) return;
    accumulatedDuration += sentenceAudio.duration;
    playSentence(index + 1);
  });
  
  sentenceAudio.addEventListener('error', onPlayError);
  sentenceAudio.load();
}

// ---- Play via Google TTS (client=tw-ob) ----
function playSentenceGoogleTTSAlternative(index) {
  const sentence = sentences[index];
  isFallbackActive = false;
  
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=tw-ob&q=${encodeURIComponent(sentence.text)}`;
  
  if (sentenceAudio) {
    sentenceAudio.pause();
    sentenceAudio = null;
  }
  
  sentenceAudio = new Audio(url);
  sentenceAudio.playbackRate = speeds[speedIdx];
  sentenceAudio.volume = volRange ? parseFloat(volRange.value) : 1;
  
  const onAlternativeError = (err) => {
    console.warn("Google TTS client=tw-ob failed, falling back to native SpeechSynthesis", err);
    const voicesList = speechSynthesis.getVoices();
    const selectedVoiceIdx = voiceSelect ? parseInt(voiceSelect.value) : -1;
    const selectedVoice = voicesList[selectedVoiceIdx];
    playSentenceNative(index, selectedVoice);
  };
  
  sentenceAudio.addEventListener('loadedmetadata', () => {
    if (!ttsPlaying || ttsPaused) return;
    sentenceAudio.play().catch(onAlternativeError);
  });
  
  sentenceAudio.addEventListener('timeupdate', () => {
    if (!sentenceAudio || isFallbackActive) return;
    
    const curTime = sentenceAudio.currentTime;
    const duration = sentenceAudio.duration || 1;
    const pct = curTime / duration;
    
    const totalChars = sentence.text.length;
    const curCharPos = pct * totalChars;
    
    let activeWordGlobalId = -1;
    for (let i = 0; i < sentence.words.length; i++) {
      const wObj = sentence.words[i];
      if (curCharPos >= wObj.startChar && curCharPos <= wObj.endChar) {
        activeWordGlobalId = wObj.globalId;
        break;
      }
    }
    
    if (activeWordGlobalId === -1 && sentence.words.length > 0) {
      const idx = Math.min(Math.floor(pct * sentence.words.length), sentence.words.length - 1);
      activeWordGlobalId = sentence.words[idx].globalId;
    }
    
    excerptTextEl.querySelectorAll('.word').forEach(span => {
      span.classList.remove('word-highlight');
    });
    const activeSpan = document.getElementById(`word-${activeWordGlobalId}`);
    if (activeSpan) {
      activeSpan.classList.add('word-highlight');
      activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    
    const currentElapsed = accumulatedDuration + curTime;
    const totalWords = BOOKS[currentBook].excerpt.split(/\s+/).filter(w => w.trim().length > 0).length;
    const currentWordInSentence = sentence.words[0] ? sentence.words[0].globalId + Math.floor(pct * sentence.words.length) : 0;
    
    let estimatedTotal = totalEstimate;
    if (currentWordInSentence > 0) {
      const avgTimePerWord = currentElapsed / currentWordInSentence;
      estimatedTotal = currentElapsed + (totalWords - currentWordInSentence) * avgTimePerWord;
    }
    
    updateProgress(currentElapsed, estimatedTotal);
  });
  
  sentenceAudio.addEventListener('ended', () => {
    if (!ttsPlaying || ttsPaused) return;
    accumulatedDuration += sentenceAudio.duration;
    playSentence(index + 1);
  });
  
  sentenceAudio.addEventListener('error', onAlternativeError);
  sentenceAudio.load();
}

// ---- Play via Native Speech Synthesis ----
function playSentenceNative(index, voice) {
  if (index >= sentences.length) {
    ttsStop();
    nowPlayingText.textContent = 'Tugatildi ✓';
    return;
  }
  
  currentSentenceIdx = index;
  const sentence = sentences[index];
  isFallbackActive = true;
  
  if (sentenceAudio) {
    sentenceAudio.pause();
    sentenceAudio = null;
  }
  
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(sentence.text);
  utterance.rate = speeds[speedIdx];
  utterance.volume = volRange ? parseFloat(volRange.value) : 1;
  utterance.lang = BOOKS[currentBook].lang;
  
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.onboundary = (e) => {
    if (!ttsPlaying || ttsPaused || !isFallbackActive) return;
    
    if (e.name === 'word') {
      let cumChars = 0;
      let targetWordIdx = 0;
      for (let i = 0; i < sentence.words.length; i++) {
        cumChars += sentence.words[i].text.length + 1;
        if (cumChars >= e.charIndex) {
          targetWordIdx = i;
          break;
        }
      }
      
      const activeWord = sentence.words[targetWordIdx];
      if (activeWord) {
        excerptTextEl.querySelectorAll('.word').forEach(span => {
          span.classList.remove('word-highlight');
        });
        const activeSpan = document.getElementById(`word-${activeWord.globalId}`);
        if (activeSpan) {
          activeSpan.classList.add('word-highlight');
          activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        
        // Progress update
        const totalWords = BOOKS[currentBook].excerpt.split(/\s+/).filter(w => w.trim().length > 0).length;
        const currentWordInSentence = activeWord.globalId;
        const currentElapsed = accumulatedDuration + (targetWordIdx * 0.35);
        const avgTimePerWord = currentElapsed / Math.max(currentWordInSentence, 1);
        const estimatedTotal = currentElapsed + (totalWords - currentWordInSentence) * avgTimePerWord;
        updateProgress(currentElapsed, estimatedTotal);
      }
    }
  };
  
  utterance.onend = () => {
    if (!ttsPlaying || ttsPaused || !isFallbackActive) return;
    accumulatedDuration += sentence.words.length * 0.35;
    playSentence(index + 1);
  };
  
  utterance.onerror = (e) => {
    if (e.error === 'interrupted') return;
    console.warn("SpeechSynthesis native error:", e.error);
    accumulatedDuration += sentence.words.length * 0.35;
    playSentence(index + 1);
  };
  
  speechSynthesis.speak(utterance);
}

// ---- Legacy Fallback Wrapper ----
function playSentenceFallback(index) {
  const voicesList = speechSynthesis.getVoices();
  const selectedVoiceIdx = voiceSelect ? parseInt(voiceSelect.value) : -1;
  const selectedVoice = voicesList[selectedVoiceIdx];
  playSentenceNative(index, selectedVoice);
}

// ---- Time format ----
function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// ---- Update Progress Elements ----
function updateProgress(cur, tot) {
  if (!elapsedEl) return;
  elapsedEl.textContent = fmt(cur);
  totalEl.textContent   = fmt(tot);
  const pct = tot > 0 ? Math.min((cur / tot) * 100, 100) : 0;
  progressFill.style.width = pct + '%';
  const thumb = document.getElementById('audio-progress-thumb');
  if (thumb) thumb.style.right = (-8) + 'px';
}

// ---- Play/Resume ----
function ttsPlay() {
  if (!window.Audio) {
    alert("Kechirasiz, brauzeringiz audioni qo'llab-quvvatlamaydi!");
    return;
  }
  
  if (ttsPaused) {
    ttsPaused = false;
    ttsPlaying = true;
    setPlayingState(true);
    
    if (sentenceAudio) {
      sentenceAudio.play().catch(err => {
        console.warn("Google TTS resume failed, falling back to SpeechSynthesis", err);
        playSentenceFallback(currentSentenceIdx);
      });
    } else if (isFallbackActive) {
      speechSynthesis.resume();
    } else {
      playSentence(currentSentenceIdx);
    }
    return;
  }
  
  ttsPlaying = true;
  ttsPaused = false;
  setPlayingState(true);
  accumulatedDuration = 0;
  playSentence(0);
}

// ---- Pause ----
function ttsPause() {
  if (ttsPlaying) {
    ttsPaused = true;
    ttsPlaying = false;
    setPlayingState(false);
    
    if (sentenceAudio) {
      sentenceAudio.pause();
    }
    
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }
}

// ---- Stop ----
function ttsStop() {
  ttsPlaying = false;
  ttsPaused = false;
  isFallbackActive = false;
  setPlayingState(false);
  
  if (sentenceAudio) {
    sentenceAudio.pause();
    sentenceAudio = null;
  }
  
  speechSynthesis.cancel();
  
  accumulatedDuration = 0;
  elapsed = 0;
  updateProgress(0, totalEstimate);
  nowPlayingText.textContent = 'Tayyor';
  excerptTextEl.querySelectorAll('.word-highlight').forEach(w => w.classList.remove('word-highlight'));
}

// ---- Playing state visual representation ----
function setPlayingState(playing) {
  playIcon.textContent = playing ? '⏸' : '▶';
  audioSection.classList.toggle('playing', playing);
  nowPlayingText.textContent = playing ? 'Ijro etilmoqda...' : (ttsPaused ? 'Pauza' : 'Tayyor');
}

// ---- Init audio ----
// ---- Init audio ----
function initAudio() {
  audioSection    = document.querySelector('.audio-section');
  playBtn         = document.getElementById('audio-play-btn');
  playIcon        = playBtn?.querySelector('.play-icon');
  nowPlayingText  = document.getElementById('now-playing-text');
  elapsedEl       = document.getElementById('audio-elapsed');
  totalEl         = document.getElementById('audio-total');
  progressFill    = document.getElementById('audio-progress-fill');
  speedBtn        = document.getElementById('audio-speed');
  voiceSelect     = document.getElementById('voice-select');
  volRange        = document.getElementById('vol-range');
  excerptTextEl   = document.getElementById('excerpt-text');
  audioCoverEl    = document.getElementById('audio-cover');
  audioTitleEl    = document.getElementById('audio-book-title');
  audioAuthorEl   = document.getElementById('audio-book-author');

  if (!playBtn) return;

  buildWaveform();
  renderBook(0);

  // Load voices
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Play/Pause toggle
  playBtn.addEventListener('click', () => {
    if (ttsPlaying) {
      ttsPause();
    } else {
      ttsPlay();
    }
  });

  // Stop
  document.getElementById('audio-stop')?.addEventListener('click', ttsStop);

  // Prev / Next
  document.getElementById('audio-prev')?.addEventListener('click', () => {
    ttsStop();
    currentBook = (currentBook - 1 + BOOKS.length) % BOOKS.length;
    renderBook(currentBook);
  });

  document.getElementById('audio-next')?.addEventListener('click', () => {
    ttsStop();
    currentBook = (currentBook + 1) % BOOKS.length;
    renderBook(currentBook);
  });

  // Speed cycle
  speedBtn?.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    const s = speeds[speedIdx];
    speedBtn.textContent = s + '×';
    
    if (sentenceAudio) {
      sentenceAudio.playbackRate = s;
    }
    
    // restart if playing to sync speed
    if (ttsPlaying || ttsPaused) {
      const isPlay = ttsPlaying;
      ttsStop();
      if (isPlay) {
        ttsPlaying = true;
        playSentence(currentSentenceIdx);
      }
    }
  });

  // Volume
  volRange?.addEventListener('input', () => {
    if (sentenceAudio) {
      sentenceAudio.volume = parseFloat(volRange.value);
    }
  });

  // Tab click
  document.querySelectorAll('.audio-tab').forEach((tab, i) => {
    tab.addEventListener('click', () => {
      ttsStop();
      currentBook = i;
      renderBook(currentBook);
    });
  });

  // Progress bar click to seek (sentence aligned)
  document.getElementById('audio-progress-bar')?.addEventListener('click', (e) => {
    const bar = e.currentTarget;
    const pct = e.offsetX / bar.offsetWidth;
    
    const originallyPlaying = ttsPlaying;
    ttsStop();
    
    const totalWords = BOOKS[currentBook].excerpt.split(/\s+/).filter(w => w.trim().length > 0).length;
    const targetWordIndex = Math.floor(pct * totalWords);
    
    let targetSentenceIdx = 0;
    let accumWords = 0;
    for (let i = 0; i < sentences.length; i++) {
      const sentenceWordsCount = sentences[i].words.length;
      if (accumWords + sentenceWordsCount > targetWordIndex) {
        targetSentenceIdx = i;
        break;
      }
      accumWords += sentenceWordsCount;
      targetSentenceIdx = i;
    }
    
    accumulatedDuration = accumWords * 0.35;
    currentSentenceIdx = targetSentenceIdx;
    
    if (originallyPlaying) {
      ttsPlaying = true;
      playSentence(currentSentenceIdx);
    } else {
      const sObj = sentences[targetSentenceIdx];
      if (sObj) {
        const wordInSentenceIdx = Math.min(targetWordIndex - accumWords, sObj.words.length - 1);
        const activeWord = sObj.words[wordInSentenceIdx];
        if (activeWord) {
          excerptTextEl.querySelectorAll('.word').forEach(span => {
            span.classList.remove('word-highlight');
          });
          const activeSpan = document.getElementById(`word-${activeWord.globalId}`);
          if (activeSpan) {
            activeSpan.classList.add('word-highlight');
            activeSpan.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
      elapsed = accumulatedDuration;
      updateProgress(elapsed, totalEstimate);
      ttsPaused = true;
    }
  });

  // Cancel speech when page hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ttsPlaying) ttsPause();
  });
}

// =============================
const quizData = [
  {
    icon: "stress",
    question: "Kitob o'qish stressni qancha foizga kamaytiradi?",
    options: ["20%", "45%", "68%", "90%"],
    correct: 2,
    explanation: "Tadqiqotlar shuni ko'rsatadiki, faqat 6 daqiqa kitob o'qish stress darajasini 68% ga kamaytiradi!"
  },
  {
    icon: "wizard",
    question: "'Harry Potter' kitobini kim yozgan?",
    options: ["J.R.R. Tolkien", "J.K. Rowling", "C.S. Lewis", "George R.R. Martin"],
    correct: 1,
    explanation: "Harry Potterni britaniyalik yozuvchi J.K. Rowling yozgan. Seriyal 1997-yilda boshlangan!"
  },
  {
    icon: "globe",
    question: "Dunyadagi eng ko'p sotilgan kitob qaysi?",
    options: ["Don Kixot", "Injil", "Little Prince", "Alchemist"],
    correct: 1,
    explanation: "Injil (Bibliya) 5 milliarddan ortiq nusxada sotilgan — tarixdagi eng ko'p sotilgan kitob!"
  },
  {
    icon: "temple",
    question: "Qadimgi Aleksandriya kutubxonasi qaysi mamlakatda joylashgan?",
    options: ["Yunoniston", "Italiya", "Misr", "Iroq"],
    correct: 2,
    explanation: "Qadimgi dunyo mo'jizasi — Aleksandriya kutubxonasi Misr mamlakatining Iskandariya shahrida joylashgan edi."
  },
  {
    icon: "pencil",
    question: "Dunyadagi eng qisqa roman necha so'zdan iborat?",
    options: ["6 so'z", "10 so'z", "50 so'z", "100 so'z"],
    correct: 0,
    explanation: "Ernest Hemingway tomonidan yozilgan eng qisqa roman 6 so'zdan iborat: 'For sale: baby shoes, never worn.'"
  },
  {
    icon: "uzb",
    question: "'O'tkan kunlar' romani kimning asari?",
    options: ["Oybek", "Cho'lpon", "Abdulla Qodiriy", "Abdulla Qahhor"],
    correct: 2,
    explanation: "'O'tkan kunlar' — Abdulla Qodiriyning 1925-yilda yozgan mashhur romani. O'zbek adabiyotining birinchi romani!"
  },
  {
    icon: "openbook",
    question: "Kitob o'qish qancha vaqt ichida uyquni yaxshilashi isbotlangan?",
    options: ["1 soat", "30 daqiqa", "2 hafta", "1 oy"],
    correct: 1,
    explanation: "Kechqurun 30 daqiqa kitob o'qish miyani tinchlantiradi va uyqu sifatini sezilarli yaxshilaydi."
  },
  {
    icon: "trophy",
    question: "Nobel adabiyot mukofotini kimlar beradi?",
    options: ["BM", "Shvetsiya akademiyasi", "Fransiya akademiyasi", "Harvard universiteti"],
    correct: 1,
    explanation: "Nobel adabiyot mukofoti har yili Shvetsiya akademiyasi tomonidan beriladi. Birinchi marta 1901-yilda berilgan!"
  }
];

// ===== STATE =====
let currentQuestion = 0;
let score = 0;
let answered = false;

// ===== DOM ELEMENTS =====
const quizEmojiEl = document.getElementById('quiz-emoji');
const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsEl = document.getElementById('quiz-options');
const quizFeedbackEl = document.getElementById('quiz-feedback');
const quizNextBtn = document.getElementById('quiz-next');
const quizResultEl = document.getElementById('quiz-result');
const quizProgressEl = document.getElementById('quiz-progress');
const quizCounterEl = document.getElementById('quiz-counter');
const quizScoreEl = document.getElementById('quiz-score');

// ===== QUIZ ICON SVG RENDERER =====
function getQuizIconSvg(iconName) {
  const styles = `width: 48px; height: 48px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; color: var(--primary); filter: drop-shadow(0 4px 12px rgba(124, 58, 237, 0.3)); display: block; margin: 0 auto;`;
  switch (iconName) {
    case 'stress': // stress relief
      return `<svg style="${styles}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>`;
    case 'wizard': // wizard/magic
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M12 2L3 22h18L12 2z"></path><path d="M6 17h12"></path><path d="M8 13h8"></path></svg>`;
    case 'globe': // globe
      return `<svg style="${styles}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>`;
    case 'temple': // temple
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M4 22V11M20 22V11M12 22V11M2 22h20M2 11h20L12 2 2 11z"></path><path d="M6 7h12"></path></svg>`;
    case 'pencil': // pencil
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    case 'uzb': // Uzbekistan
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M8 9h8M8 13h5"></path></svg>`;
    case 'openbook': // open book
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
    case 'trophy': // trophy
      return `<svg style="${styles}" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a5 5 0 0 0-5 5v3c0 2.76 2.24 5 5 5s5-2.24 5-5V7a5 5 0 0 0-5-5z"></path></svg>`;
    default:
      return `<svg style="${styles}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>`;
  }
}

// ===== LOAD QUESTION =====
function loadQuestion() {
  if (currentQuestion >= quizData.length) {
    showResult();
    return;
  }
  answered = false;
  const q = quizData[currentQuestion];
  const letters = ['A', 'B', 'C', 'D'];

  // Animate question area
  const qArea = document.getElementById('quiz-question-area');
  qArea.style.opacity = '0';
  qArea.style.transform = 'translateY(20px)';
  setTimeout(() => {
    quizEmojiEl.innerHTML = getQuizIconSvg(q.icon);
    quizQuestionEl.textContent = q.question;
    qArea.style.transition = 'all 0.4s ease';
    qArea.style.opacity = '1';
    qArea.style.transform = 'translateY(0)';
  }, 200);

  // Progress
  const pct = (currentQuestion / quizData.length) * 100;
  quizProgressEl.style.width = pct + '%';
  quizCounterEl.textContent = `Savol ${currentQuestion + 1} / ${quizData.length}`;
  quizScoreEl.textContent = `Ball: ${score}`;

  // Options
  quizOptionsEl.innerHTML = '';
  quizFeedbackEl.textContent = '';
  quizFeedbackEl.className = 'quiz-feedback';
  quizNextBtn.style.display = 'none';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.id = `quiz-opt-${i}`;
    btn.innerHTML = `<span class="quiz-opt-letter">${letters[i]}</span>${opt}`;
    btn.addEventListener('click', () => selectAnswer(i));
    quizOptionsEl.appendChild(btn);
  });

  // Stagger animation
  document.querySelectorAll('.quiz-opt').forEach((btn, i) => {
    btn.style.opacity = '0';
    btn.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      btn.style.transition = 'all 0.3s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateX(0)';
    }, 100 + i * 80);
  });
}

// ===== SELECT ANSWER =====
function selectAnswer(index) {
  if (answered) return;
  answered = true;

  const q = quizData[currentQuestion];
  const opts = document.querySelectorAll('.quiz-opt');

  opts.forEach(btn => btn.disabled = true);

  if (index === q.correct) {
    score++;
    opts[index].classList.add('correct');
    quizFeedbackEl.className = 'quiz-feedback show-correct';
    quizFeedbackEl.innerHTML = `✅ To'g'ri! ${q.explanation}`;
    createConfetti();
  } else {
    opts[index].classList.add('wrong');
    opts[q.correct].classList.add('correct');
    quizFeedbackEl.className = 'quiz-feedback show-wrong';
    quizFeedbackEl.innerHTML = `❌ Noto'g'ri. ${q.explanation}`;
  }

  quizScoreEl.textContent = `Ball: ${score}`;
  quizNextBtn.style.display = 'flex';
}

// ===== SHOW RESULT =====
function showResult() {
  const pct = Math.round((score / quizData.length) * 100);
  quizProgressEl.style.width = '100%';

  document.getElementById('quiz-question-area').style.display = 'none';
  quizOptionsEl.style.display = 'none';
  quizFeedbackEl.style.display = 'none';
  quizNextBtn.style.display = 'none';

  let iconSvg, msg;
  const resultStyle = `width: 80px; height: 80px; margin: 0 auto 16px; color: var(--primary); display: block; filter: drop-shadow(0 8px 24px rgba(124, 58, 237, 0.4));`;
  if (score >= 7) { 
    iconSvg = `<svg style="${resultStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a5 5 0 0 0-5 5v3c0 2.76 2.24 5 5 5s5-2.24 5-5V7a5 5 0 0 0-5-5z"></path></svg>`; 
    msg = "Ajoyib! Siz haqiqiy kitob oshig'isiz!"; 
  }
  else if (score >= 5) { 
    iconSvg = `<svg style="${resultStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`; 
    msg = "Yaxshi! Ko'proq kitob o'qing, bilimingiz oshadi!"; 
  }
  else if (score >= 3) { 
    iconSvg = `<svg style="${resultStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`; 
    msg = "Davom eting! Har bir kitob yangi imkoniyat!"; 
  }
  else { 
    iconSvg = `<svg style="${resultStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V10"></path><path d="M12 10a6 6 0 0 1 6-6c-2 4-6 6-6 6z"></path><path d="M12 14a6 6 0 0 0-6-6c2 4 6 6 6 6z"></path></svg>`; 
    msg = "Boshlang'ich! Kitob o'qish — eng yaxshi sarmoya!"; 
  }

  quizResultEl.style.display = 'block';
  quizResultEl.innerHTML = `
    ${iconSvg}
    <h3>Viktorina yakunlandi!</h3>
    <div class="result-score">${score}/${quizData.length}</div>
    <p style="margin-bottom:8px">${msg}</p>
    <p style="font-size:0.85rem;color:#6b7280">Natija: ${pct}%</p>
    <button class="btn btn-primary" style="margin:24px auto 0;display:flex;width:fit-content" 
            onclick="restartQuiz()" id="restart-quiz-btn">
      🔄 Qayta urinish
    </button>
  `;
  createConfetti();
}

// ===== RESTART QUIZ =====
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  answered = false;
  quizResultEl.style.display = 'none';
  document.getElementById('quiz-question-area').style.display = 'block';
  quizOptionsEl.style.display = 'flex';
  quizFeedbackEl.style.display = 'block';
  loadQuestion();
}

// ===== CONFETTI =====
function createConfetti() {
  const colors = ['#7c3aed', '#f59e0b', '#10b981', '#f472b6', '#a78bfa'];
  for (let i = 0; i < 30; i++) {
    const conf = document.createElement('div');
    conf.style.cssText = `
      position:fixed; width:8px; height:8px; border-radius:50%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      left:${Math.random() * 100}vw; top:-10px;
      z-index:9999; pointer-events:none;
      animation:confetti-fall ${0.8 + Math.random() * 1.2}s ease-in ${Math.random() * 0.5}s forwards;
    `;
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 2500);
  }
}

// Inject confetti keyframes
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes confetti-fall {
    from { transform: translateY(0) rotate(0deg); opacity: 1; }
    to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;
document.head.appendChild(styleEl);

// ===== QUIZ NEXT BUTTON =====
if (quizNextBtn) {
  quizNextBtn.addEventListener('click', () => {
    currentQuestion++;
    loadQuestion();
  });
}

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== QUOTE SLIDER =====
let activeQuote = 0;
const slides = document.querySelectorAll('.quote-slide');
const dots = document.querySelectorAll('.dot');

function goToQuote(index) {
  slides[activeQuote].classList.remove('active');
  dots[activeQuote].classList.remove('active');
  activeQuote = index;
  slides[activeQuote].classList.add('active');
  dots[activeQuote].classList.add('active');
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goToQuote(i));
});

setInterval(() => {
  goToQuote((activeQuote + 1) % slides.length);
}, 5000);

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    scrollTopBtn.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '70px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(10,10,20,0.97)';
  navLinks.style.padding = '20px';
  navLinks.style.borderBottom = '1px solid rgba(124,58,237,0.2)';
  navLinks.style.backdropFilter = 'blur(20px)';
});

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.benefit-card, .genre-card, .tip-item, .faq-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(num => {
  counterObserver.observe(num);
});

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('uz-UZ');
  }, 16);
}

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${0.3 + Math.random() * 0.4};
    `;
    container.appendChild(particle);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadQuestion();
  createParticles();

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        if (navLinks && window.innerWidth <= 768) {
          navLinks.style.display = 'none';
        }
      }
    });
  });

  // Init audio player
  initAudio();
});
