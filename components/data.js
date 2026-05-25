// Each item carries both languages. `sayHi` / `sayEn` are the spoken phrase
// (with sound effect); fall back to the plain label if absent.

export const ANIMALS = [
  { e: '🐶', hi: 'कुत्ता',    en: 'Dog',      sayHi: 'कुत्ता! भौं भौं!',     sayEn: 'Dog! Woof woof!' },
  { e: '🐱', hi: 'बिल्ली',    en: 'Cat',      sayHi: 'बिल्ली! म्याऊँ म्याऊँ!', sayEn: 'Cat! Meow meow!' },
  { e: '🐮', hi: 'गाय',      en: 'Cow',      sayHi: 'गाय! अम्बे!',          sayEn: 'Cow! Moo!' },
  { e: '🐸', hi: 'मेंढक',     en: 'Frog',     sayHi: 'मेंढक! टर्र टर्र!',       sayEn: 'Frog! Ribbit!' },
  { e: '🦁', hi: 'शेर',      en: 'Lion',     sayHi: 'शेर! दहाड़!',           sayEn: 'Lion! Roar!' },
  { e: '🐵', hi: 'बंदर',     en: 'Monkey',   sayHi: 'बंदर! ऊ ऊ आ आ!',       sayEn: 'Monkey! Ooh ooh ah ah!' },
  { e: '🐘', hi: 'हाथी',     en: 'Elephant', sayHi: 'हाथी!',                sayEn: 'Elephant! Trumpet!' },
  { e: '🦆', hi: 'बत्तख़',     en: 'Duck',     sayHi: 'बत्तख़! क्वैक क्वैक!',    sayEn: 'Duck! Quack quack!' },
  { e: '🐝', hi: 'मधुमक्खी',  en: 'Bee',      sayHi: 'मधुमक्खी! भन भन!',     sayEn: 'Bee! Buzz buzz!' },
];

export const FRUITS = [
  { e: '🍎', hi: 'सेब',       en: 'Apple' },
  { e: '🍌', hi: 'केला',      en: 'Banana' },
  { e: '🥭', hi: 'आम',       en: 'Mango' },
  { e: '🍇', hi: 'अंगूर',     en: 'Grapes' },
  { e: '🍊', hi: 'संतरा',     en: 'Orange' },
  { e: '🍓', hi: 'स्ट्रॉबेरी',  en: 'Strawberry' },
  { e: '🍉', hi: 'तरबूज़',    en: 'Watermelon' },
  { e: '🍍', hi: 'अनानास',   en: 'Pineapple' },
  { e: '🥝', hi: 'कीवी',      en: 'Kiwi' },
];

export const VEHICLES = [
  { e: '🚗', hi: 'गाड़ी',     en: 'Car',      sayHi: 'गाड़ी! पों पों!',     sayEn: 'Car! Beep beep!' },
  { e: '🚌', hi: 'बस',       en: 'Bus',      sayHi: 'बस!',               sayEn: 'Bus!' },
  { e: '🚂', hi: 'रेलगाड़ी',   en: 'Train',    sayHi: 'रेलगाड़ी! छुक छुक!', sayEn: 'Train! Choo choo!' },
  { e: '✈️', hi: 'हवाई जहाज़', en: 'Airplane', sayHi: 'हवाई जहाज़!',        sayEn: 'Airplane!' },
  { e: '🚲', hi: 'साइकिल',   en: 'Bicycle',  sayHi: 'साइकिल! टन टन!',    sayEn: 'Bicycle! Ring ring!' },
  { e: '⛵', hi: 'नाव',      en: 'Boat',     sayHi: 'नाव!',              sayEn: 'Boat!' },
  { e: '🚒', hi: 'दमकल',    en: 'Fire truck', sayHi: 'दमकल!',           sayEn: 'Fire truck!' },
  { e: '🚜', hi: 'ट्रैक्टर',   en: 'Tractor',  sayHi: 'ट्रैक्टर!',           sayEn: 'Tractor!' },
  { e: '🚀', hi: 'रॉकेट',     en: 'Rocket',   sayHi: 'रॉकेट! फुर्र!',       sayEn: 'Rocket! Whoosh!' },
];

export const BODY = [
  { e: '👁️', hi: 'आँख',   en: 'Eye' },
  { e: '👃', hi: 'नाक',   en: 'Nose' },
  { e: '👂', hi: 'कान',   en: 'Ear' },
  { e: '👄', hi: 'मुँह',   en: 'Mouth' },
  { e: '✋', hi: 'हाथ',   en: 'Hand' },
  { e: '🦶', hi: 'पैर',    en: 'Foot' },
  { e: '🦷', hi: 'दाँत',   en: 'Tooth' },
  { e: '👅', hi: 'जीभ',   en: 'Tongue' },
  { e: '🧠', hi: 'दिमाग़',  en: 'Brain' },
];

export const COLORS = [
  { hi: 'लाल',    en: 'Red',    hex: '#ff5252' },
  { hi: 'नीला',    en: 'Blue',   hex: '#4dabf7' },
  { hi: 'पीला',    en: 'Yellow', hex: '#ffd43b' },
  { hi: 'हरा',     en: 'Green',  hex: '#51cf66' },
  { hi: 'बैंगनी',   en: 'Purple', hex: '#cc5de8' },
  { hi: 'नारंगी',   en: 'Orange', hex: '#ff922b' },
];

export const NUM_WORDS = {
  hi: ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'],
  en: ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
};
export const NUM_EMOJI = ['🌟','🎈','🍎','🦋','🌸','🐞','🍓','🐥','🎀','💖'];

export const CHEERS = {
  hi: ['शाबाश अक्षिता!', 'बहुत अच्छा!', 'वाह वाह!', 'क्या बात है!'],
  en: ['Yay Akshita!', 'Great job!', 'Wow!', 'Amazing!'],
};

// English A–Z and Hindi varnamala (vowels + main consonants).
// Each item: e = the glyph shown, hi/en = label, text = same as glyph (used as speech key).
export const ALPHABETS = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ({ e: c, hi: c, en: c })),
  hi: [
    'अ','आ','इ','ई','उ','ऊ','ऋ','ए','ऐ','ओ','औ','अं','अः',
    'क','ख','ग','घ','ङ',
    'च','छ','ज','झ','ञ',
    'ट','ठ','ड','ढ','ण',
    'त','थ','द','ध','न',
    'प','फ','ब','भ','म',
    'य','र','ल','व',
    'श','ष','स','ह',
  ].map(c => ({ e: c, hi: c, en: c })),
};

export const NOTES = [
  { e: '🔴', f: 261.63, c: '#ff6b6b' },
  { e: '🟠', f: 293.66, c: '#ff922b' },
  { e: '🟡', f: 329.63, c: '#fcc419' },
  { e: '🟢', f: 349.23, c: '#51cf66' },
  { e: '🔵', f: 392.00, c: '#4dabf7' },
  { e: '🟣', f: 440.00, c: '#cc5de8' },
  { e: '⭐', f: 493.88, c: '#ffd43b' },
  { e: '💖', f: 523.25, c: '#f783ac' },
  { e: '🌈', f: 587.33, c: '#9775fa' },
];

// ---- localized strings ----
export const STRINGS = {
  hi: {
    greeting: 'नमस्ते अक्षिता! 🌸',
    menu: {
      animals: 'जानवर', balloons: 'गुब्बारे', colors: 'रंग', music: 'संगीत',
      numbers: 'गिनती', fruits: 'फल', vehicles: 'गाड़ियाँ', body: 'शरीर',
      alphabet: 'वर्णमाला',
    },
    parentBtn: '🎤 अपनी आवाज़ रिकॉर्ड करें (Parent mode)',
    parentTitle: '🎤 अपनी आवाज़ रिकॉर्ड करें',
    parentDesc: 'हर शब्द के लिए 🎤 दबाकर अपनी आवाज़ रिकॉर्ड करें।',
    findX: (c) => `${c.hi} ढूँढो!`,
    findXSay: (c) => `${c.hi} ढूँढो`,
    numTap: 'कहीं भी छुओ ✨',
    voiceTip: 'Parent mode में अपनी आवाज़ रिकॉर्ड करें 🎤',
  },
  en: {
    greeting: 'Hi Akshita! 🌸',
    menu: {
      animals: 'Animals', balloons: 'Balloons', colors: 'Colors', music: 'Music',
      numbers: 'Numbers', fruits: 'Fruits', vehicles: 'Vehicles', body: 'Body',
      alphabet: 'Alphabet',
    },
    parentBtn: '🎤 Record your voice (Parent mode)',
    parentTitle: '🎤 Record your voice',
    parentDesc: 'Tap 🎤 next to each word to record it in your voice.',
    findX: (c) => `Find ${c.en}!`,
    findXSay: (c) => `Find the ${c.en}`,
    numTap: 'Tap anywhere ✨',
    voiceTip: 'Tip: record your voice in Parent mode 🎤',
  },
};

// ---- helpers ----
export const labelOf = (it, lang) => it[lang];
export const sayOf = (it, lang) =>
  it[lang === 'hi' ? 'sayHi' : 'sayEn'] || it[lang];
