'use client';
import { useState, useEffect, useRef, useCallback, createContext, useContext, Component } from 'react';
import {
  ANIMALS, FRUITS, VEHICLES, BODY, COLORS, NUM_WORDS, NUM_EMOJI, CHEERS, NOTES,
  ALPHABETS, STRINGS, labelOf, sayOf,
} from './data';
import {
  getCtx, loadVoices, loadRecordedIndex,
  speak, cancelSpeak, playTone, playPop,
  uploadClip, deleteClip, recordedKeysSnapshot,
} from './audio';
import { startMusic, stopMusic, setMusicVolume } from './bgMusic';

// ---------- Error boundary ----------
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error('ErrorBoundary caught:', err, info); }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 80, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h3 style={{ color: '#c92a2a' }}>Something broke:</h3>
          <div>{String(this.state.err && (this.state.err.stack || this.state.err.message || this.state.err))}</div>
          <button style={{ marginTop: 20, padding: '10px 20px' }} onClick={() => this.setState({ err: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- Language context ----------
const LangCtx = createContext({ lang: 'hi', setLang: () => {} });
const useLang = () => useContext(LangCtx);
const cheerOf = (lang) => {
  const arr = CHEERS[lang];
  return arr[Math.floor(Math.random() * arr.length)];
};

// ---------- Cheer overlay ----------
function Cheer({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="cheer">{text}</div>;
}

// ---------- Language toggle ----------
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-toggle">
      <button className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>हिंदी</button>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>English</button>
    </div>
  );
}

// ---------- Music toggle + volume ----------
function MusicToggle({ on, onToggle }) {
  return (
    <button className="music-toggle" onClick={onToggle} title={on ? 'Music on' : 'Music off'}>
      {on ? '🎵' : '🔇'}
    </button>
  );
}
function VolumeSlider({ value, onChange }) {
  return (
    <div className="volume-wrap" title="Background music volume">
      <span className="volume-icon">🔈</span>
      <input
        type="range" min="0" max="100" value={Math.round(value * 100)}
        onChange={e => onChange(Number(e.target.value) / 100)}
        className="volume-slider"
      />
      <span className="volume-icon">🔊</span>
    </div>
  );
}

// ---------- Home ----------
function Home({ onPick, musicOn, onToggleMusic, musicVol, onVolChange }) {
  const { lang } = useLang();
  const t = STRINGS[lang];
  return (
    <div className="home">
      <div className="home-header">
        <LangToggle />
        <MusicToggle on={musicOn} onToggle={onToggleMusic} />
        <VolumeSlider value={musicVol} onChange={onVolChange} />
      </div>
      <h1>{t.greeting}</h1>
      <div className="menu">
        <button className="m1" onClick={() => onPick('animals')}><span className="emoji">🐶</span>{t.menu.animals}</button>
        <button className="m2" onClick={() => onPick('balloons')}><span className="emoji">🎈</span>{t.menu.balloons}</button>
        <button className="m3" onClick={() => onPick('colors')}><span className="emoji">🎨</span>{t.menu.colors}</button>
        <button className="m4" onClick={() => onPick('music')}><span className="emoji">🎵</span>{t.menu.music}</button>
        <button className="m5" onClick={() => onPick('numbers')}><span className="emoji">🔢</span>{t.menu.numbers}</button>
        <button className="m6" onClick={() => onPick('fruits')}><span className="emoji">🍎</span>{t.menu.fruits}</button>
        <button className="m7" onClick={() => onPick('vehicles')}><span className="emoji">🚗</span>{t.menu.vehicles}</button>
        <button className="m8" onClick={() => onPick('body')}><span className="emoji">👁️</span>{t.menu.body}</button>
        <button className="m9" onClick={() => onPick('alphabet')}><span className="emoji">🔤</span>{t.menu.alphabet}</button>
      </div>
      <button className="parent-btn" onClick={() => onPick('parent')}>{t.parentBtn}</button>
    </div>
  );
}

// ---------- Alphabet ----------
function Alphabet() {
  const { lang } = useLang();
  const items = ALPHABETS[lang];
  const [picked, setPicked] = useState(null);
  const onTap = (it) => {
    setPicked(it);
    speak(it.e);
    setTimeout(() => setPicked(null), 1500);
  };
  return (
    <div className="alphabet-stage">
      <div className="alphabet-grid">
        {items.map((it, i) => (
          <button key={i} className="alphabet-btn" onClick={() => onTap(it)}>
            {it.e}
          </button>
        ))}
      </div>
      {picked && (
        <div className="big-overlay">
          <div className="e">{picked.e}</div>
        </div>
      )}
    </div>
  );
}

// ---------- TapSpeakGrid ----------
function TapSpeakGrid({ items, cols = 3 }) {
  const { lang } = useLang();
  const [picked, setPicked] = useState(null);
  const onTap = (it) => {
    setPicked(it);
    speak(sayOf(it, lang), lang);
    setTimeout(() => setPicked(null), 2000);
  };
  return (
    <div className="stage">
      <div className={`tap-grid cols-${cols}`}>
        {items.map((it, i) => (
          <button key={i} className="tap-btn" onClick={() => onTap(it)}>
            <span>{it.e}</span>
            <span className="label">{labelOf(it, lang)}</span>
          </button>
        ))}
      </div>
      {picked && (
        <div className="big-overlay">
          <div className="e">{picked.e}</div>
          <div className="label">{labelOf(picked, lang)}</div>
        </div>
      )}
    </div>
  );
}

// ---------- Balloons ----------
function Balloons() {
  const { lang } = useLang();
  const [balloons, setBalloons] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [score, setScore] = useState(0);
  const idRef = useRef(0);
  const [cheer, setCheer] = useState(null);

  useEffect(() => {
    const spawn = () => {
      const id = ++idRef.current;
      const left = 5 + Math.random() * 85;
      const duration = 6000 + Math.random() * 3000;
      setBalloons(b => [...b, { id, left, duration }]);
      setTimeout(() => setBalloons(b => b.filter(x => x.id !== id)), duration);
    };
    spawn();
    const iv = setInterval(spawn, 1200);
    return () => clearInterval(iv);
  }, []);

  const pop = (id, x, y) => {
    playPop();
    setBalloons(b => b.filter(x => x.id !== id));
    const bid = ++idRef.current;
    setBursts(prev => [...prev, { id: bid, x, y }]);
    setTimeout(() => setBursts(prev => prev.filter(b => b.id !== bid)), 600);
    setScore(s => {
      const ns = s + 1;
      if (ns % 5 === 0) {
        const c = cheerOf(lang);
        setCheer(c);
        speak(c, lang);
      }
      return ns;
    });
  };

  return (
    <div className="stage" style={{ overflow: 'hidden' }}>
      <div className="score">⭐ {score}</div>
      {balloons.map(b => <Balloon key={b.id} b={b} onPop={pop} />)}
      {bursts.map(b => (
        <div key={b.id} className="pop-burst" style={{ left: b.x, top: b.y }}>✨</div>
      ))}
      {cheer && <Cheer text={cheer} onDone={() => setCheer(null)} />}
    </div>
  );
}
function Balloon({ b, onPop }) {
  const ref = useRef(null);
  const [y, setY] = useState(typeof window !== 'undefined' ? window.innerHeight + 100 : 1000);
  useEffect(() => { requestAnimationFrame(() => setY(-200)); }, []);
  const handle = () => {
    const rect = ref.current.getBoundingClientRect();
    onPop(b.id, rect.left, rect.top);
  };
  return (
    <div
      ref={ref}
      className="balloon"
      onClick={handle}
      onTouchStart={handle}
      style={{
        left: `${b.left}%`,
        top: 0,
        transform: `translateY(${y}px)`,
        transition: `transform ${b.duration}ms linear`,
        filter: `hue-rotate(${(b.id * 47) % 360}deg)`,
      }}
    >🎈</div>
  );
}

// ---------- Colors ----------
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n, must) {
  const pool = arr.filter(x => x !== must);
  const out = [must];
  while (out.length < n) {
    const p = pick(pool);
    if (!out.includes(p)) out.push(p);
  }
  return out.sort(() => Math.random() - 0.5);
}
function ColorMatch() {
  const { lang } = useLang();
  const t = STRINGS[lang];
  const [target, setTarget] = useState(() => COLORS[0]);
  const [options, setOptions] = useState(() => pickN(COLORS, 3, COLORS[0]));
  const [wrongKey, setWrongKey] = useState(null);
  const [cheer, setCheer] = useState(null);

  const next = useCallback(() => {
    const nx = pick(COLORS);
    setTarget(nx);
    setOptions(pickN(COLORS, 3, nx));
  }, []);
  useEffect(() => { speak(t.findXSay(target), lang); }, [target, lang]);

  const choose = (c) => {
    if (c.hi === target.hi) {
      playTone(660, 0.2); setTimeout(() => playTone(880, 0.3), 150);
      const cc = cheerOf(lang);
      setCheer(cc);
      speak(labelOf(target, lang), lang);
      setTimeout(() => speak(cc, lang), 700);
      setTimeout(next, 1800);
    } else {
      playTone(200, 0.3, 'sawtooth');
      setWrongKey(c.hi);
      setTimeout(() => setWrongKey(null), 400);
    }
  };

  return (
    <div className="stage">
      <div className="prompt">{t.findX(target)}</div>
      <div className="color-shape" style={{ color: target.hex }}>⬤</div>
      <div className="color-options">
        {options.map(c => (
          <div
            key={c.hi}
            className={`color-circle ${wrongKey === c.hi ? 'wrong' : ''}`}
            style={{ background: c.hex }}
            onClick={() => choose(c)}
          />
        ))}
      </div>
      {cheer && <Cheer text={cheer} onDone={() => setCheer(null)} />}
    </div>
  );
}

// ---------- Music ----------
function Music() {
  return (
    <div className="stage">
      <div className="music-grid">
        {NOTES.map((n, i) => (
          <button
            key={i}
            className="music-btn"
            style={{ background: n.c }}
            onClick={() => playTone(n.f, 0.6, 'triangle')}
          >{n.e}</button>
        ))}
      </div>
    </div>
  );
}

// ---------- Numbers ----------
function Numbers() {
  const { lang } = useLang();
  const t = STRINGS[lang];
  const words = NUM_WORDS[lang];
  const [n, setN] = useState(1);
  const [showCheer, setShowCheer] = useState(null);
  const tap = () => {
    const next = n >= 10 ? 1 : n + 1;
    setN(next);
    speak(words[next], lang);
    if (next === 10) {
      setTimeout(() => {
        const c = cheerOf(lang);
        setShowCheer(c);
        speak(c, lang);
      }, 700);
    }
  };
  const emoji = NUM_EMOJI[(n - 1) % NUM_EMOJI.length];
  return (
    <div className="stage" onClick={tap} style={{ cursor: 'pointer' }}>
      <div className="num-display" key={n}>{n}</div>
      <div className="num-items">{emoji.repeat(n)}</div>
      <div className="num-items" style={{ color: '#d63384', marginTop: 6 }}>{words[n]}</div>
      <div className="num-tap">{t.numTap}</div>
      {showCheer && <Cheer text={showCheer} onDone={() => setShowCheer(null)} />}
    </div>
  );
}

// ---------- Parent record mode ----------
function buildVoiceLibrary(lang) {
  return [
    { title: '🐶 ' + STRINGS[lang].menu.animals,  items: ANIMALS.map(a  => ({ label: labelOf(a, lang), emoji: a.e,        text: sayOf(a, lang) })) },
    { title: '🍎 ' + STRINGS[lang].menu.fruits,   items: FRUITS.map(f   => ({ label: labelOf(f, lang), emoji: f.e,        text: labelOf(f, lang) })) },
    { title: '🚗 ' + STRINGS[lang].menu.vehicles, items: VEHICLES.map(v => ({ label: labelOf(v, lang), emoji: v.e,        text: sayOf(v, lang) })) },
    { title: '👁️ ' + STRINGS[lang].menu.body,     items: BODY.map(b     => ({ label: labelOf(b, lang), emoji: b.e,        text: labelOf(b, lang) })) },
    { title: '🎨 ' + STRINGS[lang].menu.colors,   items: COLORS.flatMap(c => [
        { label: labelOf(c, lang), emoji: '⬤', text: labelOf(c, lang), color: c.hex },
        { label: STRINGS[lang].findXSay(c), emoji: '🔍', text: STRINGS[lang].findXSay(c), color: c.hex },
      ]) },
    { title: '🔢 ' + STRINGS[lang].menu.numbers,  items: NUM_WORDS[lang].slice(1).map((w, i) => ({ label: w, emoji: String(i + 1), text: w })) },
    { title: '🔤 ' + STRINGS[lang].menu.alphabet, items: ALPHABETS[lang].map(a => ({ label: a.e, emoji: a.e, text: a.e })) },
    { title: '🌟 ' + (lang === 'hi' ? 'तारीफ़' : 'Praise'), items: CHEERS[lang].map(c => ({ label: c, emoji: '🌟', text: c })) },
  ];
}

function ParentMode() {
  const { lang } = useLang();
  const t = STRINGS[lang];
  const [groups, setGroups] = useState(() => buildVoiceLibrary(lang));
  const [recordingKey, setRecordingKey] = useState(null);
  const [recorded, setRecorded] = useState(new Set());
  const [error, setError] = useState(null);
  const mediaRef = useRef({ recorder: null, chunks: [], stream: null });

  const insecure = typeof window !== 'undefined'
    && !window.isSecureContext
    && window.location.hostname !== 'localhost'
    && window.location.hostname !== '127.0.0.1';
  const noMic = typeof window !== 'undefined'
    && !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  useEffect(() => { setGroups(buildVoiceLibrary(lang)); }, [lang]);
  useEffect(() => {
    loadRecordedIndex().then(() => setRecorded(new Set(recordedKeysSnapshot())));
  }, []);

  const refresh = () => setRecorded(new Set(recordedKeysSnapshot()));

  const startRec = async (key) => {
    setError(null);
    if (insecure) {
      setError('Microphone is blocked because this page is not HTTPS. Open the app via https:// (or localhost).');
      return;
    }
    if (noMic) {
      setError('navigator.mediaDevices is unavailable. Browser/secure-context limitation.');
      return;
    }
    try {
      if (mediaRef.current.recorder) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(tr => tr.stop());
        const blob = new Blob(chunks, { type: mime });
        try {
          const ok = await uploadClip(key, blob);
          if (!ok) setError('Upload failed. Server rejected the clip (check API/storage).');
        } catch (e) {
          setError('Upload error: ' + (e && e.message ? e.message : e));
        }
        mediaRef.current = { recorder: null, chunks: [], stream: null };
        setRecordingKey(null);
        refresh();
      };
      mediaRef.current = { recorder: rec, chunks, stream };
      rec.start();
      setRecordingKey(key);
    } catch (e) {
      setError('Microphone error: ' + (e && e.message ? e.message : e));
    }
  };
  const stopRec = () => {
    const r = mediaRef.current.recorder;
    if (r && r.state !== 'inactive') r.stop();
  };
  const delRec = async (key) => {
    await deleteClip(key);
    refresh();
  };

  return (
    <div className="parent-stage">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <LangToggle />
      </div>
      <h2 style={{ textAlign: 'center', color: '#d63384', margin: '10px 0' }}>{t.parentTitle}</h2>
      <p style={{ textAlign: 'center', color: '#666', margin: '0 0 20px', fontSize: '0.95rem' }}>{t.parentDesc}</p>
      {(insecure || noMic) && (
        <div style={{ background: '#fff3bf', border: '2px solid #ffd43b', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: '0.9rem', color: '#5c3a00' }}>
          ⚠️ Microphone unavailable: page is not in a secure context (HTTPS required). Recording will not work here.
        </div>
      )}
      {error && (
        <div style={{ background: '#ffe3e3', border: '2px solid #ff8787', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: '0.9rem', color: '#a61e1e' }}>
          {error}
        </div>
      )}
      {groups.map(g => (
        <div key={g.title} className="parent-group">
          <h3>{g.title}</h3>
          <div className="parent-items">
            {g.items.map(it => {
              const has = recorded.has(it.text);
              const isRec = recordingKey === it.text;
              return (
                <div key={it.text} className={`parent-row ${isRec ? 'rec' : ''}`}>
                  <span className="pr-emoji" style={it.color ? { color: it.color } : undefined}>{it.emoji}</span>
                  <span className="pr-label">{it.label}</span>
                  <span className={`pr-dot ${has ? 'on' : ''}`} title={has ? 'Recorded' : 'Not recorded'}>●</span>
                  {!isRec
                    ? <button className="pr-btn rec" onClick={() => startRec(it.text)}>🎤</button>
                    : <button className="pr-btn stop" onClick={stopRec}>⏹</button>}
                  <button className="pr-btn" disabled={!has} onClick={() => speak(it.text, lang)}>▶️</button>
                  <button className="pr-btn" disabled={!has} onClick={() => delRec(it.text)}>🗑</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ height: 40 }} />
    </div>
  );
}

// ---------- App ----------
export default function Games() {
  const [lang, setLangState] = useState('hi');
  const [view, setView] = useState('home');
  const [musicOn, setMusicOn] = useState(true);
  const [musicVol, setMusicVolState] = useState(0.15);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang === 'hi' || savedLang === 'en') setLangState(savedLang);
      const savedMusic = localStorage.getItem('music');
      if (savedMusic === '0') setMusicOn(false);
      const savedVol = localStorage.getItem('musicVol');
      if (savedVol != null) {
        const v = Number(savedVol);
        if (!Number.isNaN(v)) { setMusicVolState(v); setMusicVolume(v); }
      }
    } catch (e) {}
    loadRecordedIndex();
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch (e) {}
    if (musicOn) startMusic();
  };

  const toggleMusic = () => {
    setMusicOn(prev => {
      const next = !prev;
      if (next) startMusic(); else stopMusic();
      try { localStorage.setItem('music', next ? '1' : '0'); } catch (e) {}
      return next;
    });
  };

  const changeVol = (v) => {
    setMusicVolState(v);
    setMusicVolume(v);
    try { localStorage.setItem('musicVol', String(v)); } catch (e) {}
  };

  const go = (v) => {
    getCtx();
    loadVoices();
    if (musicOn) startMusic();
    setView(v);
  };
  const home = () => { cancelSpeak(); setView('home'); };

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      {view !== 'home' && (
        <button className="back" onClick={home}>🏠</button>
      )}
      {view === 'home' && <Home onPick={go} musicOn={musicOn} onToggleMusic={toggleMusic} musicVol={musicVol} onVolChange={changeVol} />}
      {view === 'animals' && <TapSpeakGrid items={ANIMALS} />}
      {view === 'fruits' && <TapSpeakGrid items={FRUITS} />}
      {view === 'vehicles' && <TapSpeakGrid items={VEHICLES} />}
      {view === 'body' && <TapSpeakGrid items={BODY} />}
      {view === 'balloons' && <Balloons />}
      {view === 'colors' && <ColorMatch />}
      {view === 'music' && <Music />}
      {view === 'numbers' && <Numbers />}
      {view === 'alphabet' && <Alphabet />}
      {view === 'parent' && <ErrorBoundary><ParentMode /></ErrorBoundary>}
      {view !== 'parent' && (
        <div className="voice-note">{STRINGS[lang].voiceTip}</div>
      )}
    </LangCtx.Provider>
  );
}
