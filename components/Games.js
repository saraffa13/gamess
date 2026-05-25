'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ANIMALS, FRUITS, VEHICLES, BODY, COLORS, NUM_WORDS, NUM_EMOJI, CHEERS, NOTES,
} from './data';
import {
  getCtx, loadVoices, loadRecordedIndex,
  speak, cancelSpeak, playTone, playPop,
  uploadClip, deleteClip, hasRecording, recordedKeysSnapshot,
} from './audio';

const cheerOf = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];

// ---------- Cheer overlay ----------
function Cheer({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1100);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="cheer">{text}</div>;
}

// ---------- Home ----------
function Home({ onPick }) {
  return (
    <div className="home">
      <h1>नमस्ते अक्षिता! 🌸</h1>
      <div className="menu">
        <button className="m1" onClick={() => onPick('animals')}><span className="emoji">🐶</span>जानवर</button>
        <button className="m2" onClick={() => onPick('balloons')}><span className="emoji">🎈</span>गुब्बारे</button>
        <button className="m3" onClick={() => onPick('colors')}><span className="emoji">🎨</span>रंग</button>
        <button className="m4" onClick={() => onPick('music')}><span className="emoji">🎵</span>संगीत</button>
        <button className="m5" onClick={() => onPick('numbers')}><span className="emoji">🔢</span>गिनती</button>
        <button className="m6" onClick={() => onPick('fruits')}><span className="emoji">🍎</span>फल</button>
        <button className="m7" onClick={() => onPick('vehicles')}><span className="emoji">🚗</span>गाड़ियाँ</button>
        <button className="m8" onClick={() => onPick('body')}><span className="emoji">👁️</span>शरीर</button>
      </div>
      <button className="parent-btn" onClick={() => onPick('parent')}>
        🎤 अपनी आवाज़ रिकॉर्ड करें (Parent mode)
      </button>
    </div>
  );
}

// ---------- TapSpeakGrid (animals/fruits/vehicles/body) ----------
function TapSpeakGrid({ items, cols = 3 }) {
  const [picked, setPicked] = useState(null);
  const onTap = (it) => {
    setPicked(it);
    speak(it.say || it.hi);
    setTimeout(() => setPicked(null), 2000);
  };
  return (
    <div className="stage">
      <div className={`tap-grid cols-${cols}`}>
        {items.map((it, i) => (
          <button key={i} className="tap-btn" onClick={() => onTap(it)}>
            <span>{it.e}</span>
            <span className="label">{it.hi}</span>
          </button>
        ))}
      </div>
      {picked && (
        <div className="big-overlay">
          <div className="e">{picked.e}</div>
          <div className="label">{picked.hi}</div>
        </div>
      )}
    </div>
  );
}

// ---------- Balloons ----------
function Balloons() {
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
        const c = cheerOf();
        setCheer(c);
        speak(c);
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
  const [target, setTarget] = useState(() => COLORS[0]);
  const [options, setOptions] = useState(() => pickN(COLORS, 3, COLORS[0]));
  const [wrongId, setWrongId] = useState(null);
  const [cheer, setCheer] = useState(null);

  const next = useCallback(() => {
    const t = pick(COLORS);
    setTarget(t);
    setOptions(pickN(COLORS, 3, t));
  }, []);
  useEffect(() => { speak(`${target.hi} ढूँढो`); }, [target]);

  const choose = (c) => {
    if (c.hi === target.hi) {
      playTone(660, 0.2); setTimeout(() => playTone(880, 0.3), 150);
      const cc = cheerOf();
      setCheer(cc);
      speak(target.hi);
      setTimeout(() => speak(cc), 600);
      setTimeout(next, 1700);
    } else {
      playTone(200, 0.3, 'sawtooth');
      setWrongId(c.hi);
      setTimeout(() => setWrongId(null), 400);
    }
  };

  return (
    <div className="stage">
      <div className="prompt">{target.hi} ढूँढो!</div>
      <div className="color-shape" style={{ color: target.hex }}>⬤</div>
      <div className="color-options">
        {options.map(c => (
          <div
            key={c.hi}
            className={`color-circle ${wrongId === c.hi ? 'wrong' : ''}`}
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
  const [n, setN] = useState(1);
  const [showCheer, setShowCheer] = useState(null);
  const tap = () => {
    const next = n >= 10 ? 1 : n + 1;
    setN(next);
    speak(NUM_WORDS[next]);
    if (next === 10) {
      setTimeout(() => {
        const c = cheerOf();
        setShowCheer(c);
        speak(c);
      }, 700);
    }
  };
  const emoji = NUM_EMOJI[(n - 1) % NUM_EMOJI.length];
  return (
    <div className="stage" onClick={tap} style={{ cursor: 'pointer' }}>
      <div className="num-display" key={n}>{n}</div>
      <div className="num-items">{emoji.repeat(n)}</div>
      <div className="num-items" style={{ color: '#d63384', marginTop: 6 }}>{NUM_WORDS[n]}</div>
      <div className="num-tap">कहीं भी छुओ ✨</div>
      {showCheer && <Cheer text={showCheer} onDone={() => setShowCheer(null)} />}
    </div>
  );
}

// ---------- Parent record mode ----------
function buildVoiceLibrary() {
  return [
    { title: '🐶 जानवर', items: ANIMALS.map(a => ({ label: a.hi, emoji: a.e, text: a.say })) },
    { title: '🍎 फल', items: FRUITS.map(f => ({ label: f.hi, emoji: f.e, text: f.hi })) },
    { title: '🚗 गाड़ियाँ', items: VEHICLES.map(v => ({ label: v.hi, emoji: v.e, text: v.say })) },
    { title: '👁️ शरीर', items: BODY.map(b => ({ label: b.hi, emoji: b.e, text: b.hi })) },
    { title: '🎨 रंग', items: COLORS.flatMap(c => [
        { label: c.hi, emoji: '⬤', text: c.hi, color: c.hex },
        { label: `${c.hi} ढूँढो`, emoji: '🔍', text: `${c.hi} ढूँढो`, color: c.hex },
      ]) },
    { title: '🔢 गिनती', items: NUM_WORDS.slice(1).map((w, i) => ({ label: w, emoji: String(i + 1), text: w })) },
    { title: '🌟 तारीफ़', items: CHEERS.map(c => ({ label: c, emoji: '🌟', text: c })) },
  ];
}

function ParentMode() {
  const [groups] = useState(buildVoiceLibrary);
  const [recordingKey, setRecordingKey] = useState(null);
  const [recorded, setRecorded] = useState(new Set());
  const mediaRef = useRef({ recorder: null, chunks: [], stream: null });

  useEffect(() => {
    loadRecordedIndex().then(() => setRecorded(new Set(recordedKeysSnapshot())));
  }, []);

  const refresh = () => setRecorded(new Set(recordedKeysSnapshot()));

  const startRec = async (key) => {
    try {
      if (mediaRef.current.recorder) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: mime });
        await uploadClip(key, blob);
        mediaRef.current = { recorder: null, chunks: [], stream: null };
        setRecordingKey(null);
        refresh();
      };
      mediaRef.current = { recorder: rec, chunks, stream };
      rec.start();
      setRecordingKey(key);
    } catch (e) {
      alert('Microphone permission needed: ' + e.message);
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
      <h2 style={{ textAlign: 'center', color: '#d63384', margin: '10px 0' }}>
        🎤 Record your voice for Akshita
      </h2>
      <p style={{ textAlign: 'center', color: '#666', margin: '0 0 20px', fontSize: '0.95rem' }}>
        Tap 🎤 to record your voice for each word. The app will play your voice instead of TTS.
        Clips are saved to SQLite on the server.
      </p>
      {groups.map(g => (
        <div key={g.title} className="parent-group">
          <h3>{g.title}</h3>
          <div className="parent-items">
            {g.items.map(it => {
              const has = recorded.has(it.text);
              const isRec = recordingKey === it.text;
              return (
                <div key={it.text} className={`parent-row ${isRec ? 'rec' : ''}`}>
                  <span className="pr-emoji" style={it.color ? { color: it.color } : null}>{it.emoji}</span>
                  <span className="pr-label">{it.label}</span>
                  <span className={`pr-dot ${has ? 'on' : ''}`} title={has ? 'Recorded' : 'Not recorded'}>●</span>
                  {!isRec
                    ? <button className="pr-btn rec" onClick={() => startRec(it.text)}>🎤</button>
                    : <button className="pr-btn stop" onClick={stopRec}>⏹</button>}
                  <button className="pr-btn" disabled={!has} onClick={() => speak(it.text)}>▶️</button>
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
  const [view, setView] = useState('home');
  useEffect(() => { loadRecordedIndex(); }, []);
  const go = (v) => { getCtx(); loadVoices(); setView(v); };
  const home = () => { cancelSpeak(); setView('home'); };
  return (
    <>
      {view !== 'home' && (
        <button className="back" onClick={home}>🏠</button>
      )}
      {view === 'home' && <Home onPick={go} />}
      {view === 'animals' && <TapSpeakGrid items={ANIMALS} />}
      {view === 'fruits' && <TapSpeakGrid items={FRUITS} />}
      {view === 'vehicles' && <TapSpeakGrid items={VEHICLES} />}
      {view === 'body' && <TapSpeakGrid items={BODY} />}
      {view === 'balloons' && <Balloons />}
      {view === 'colors' && <ColorMatch />}
      {view === 'music' && <Music />}
      {view === 'numbers' && <Numbers />}
      {view === 'parent' && <ParentMode />}
      {view !== 'parent' && (
        <div className="voice-note">Tip: Record your own voice in Parent mode for best quality 🎤</div>
      )}
    </>
  );
}
