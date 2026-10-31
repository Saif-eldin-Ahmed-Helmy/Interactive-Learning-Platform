import logo from '../assets/logo.png';

// Vector hero art: a code editor, the lesson it builds and the learner's progress, with the owl mascot.
export const HeroIllustration = () => (
  <svg viewBox="0 0 560 470" className="hero-art" role="img" aria-label="A code editor next to a lesson preview with quiz and streak badges">
    <defs>
      <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#3fa9f5" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#3fa9f5" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="hero-video" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1d7fd1" />
        <stop offset="100%" stopColor="#6a5cf6" />
      </linearGradient>
      <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#021a2b" floodOpacity="0.45" />
      </filter>
    </defs>


    {/* Code editor */}
    <g filter="url(#hero-shadow)">
      <rect x="30" y="70" width="330" height="236" rx="16" fill="#0d1f2d" />
      <rect x="30" y="70" width="330" height="36" rx="16" fill="#132b3d" />
      <rect x="30" y="92" width="330" height="14" fill="#132b3d" />
      <circle cx="52" cy="88" r="5" fill="#ff5f57" />
      <circle cx="68" cy="88" r="5" fill="#febc2e" />
      <circle cx="84" cy="88" r="5" fill="#28c840" />
      <rect x="104" y="78" width="74" height="22" rx="6" fill="#0d1f2d" />
      <text x="141" y="93" textAnchor="middle" fontSize="11" fill="#9fc3df" className="hero-code">Lesson.tsx</text>
      <g fontSize="13.5" className="hero-code">
        <text x="48" y="136" fill="#4d6b82">1</text>
        <text x="70" y="136"><tspan fill="#c792ea">function</tspan><tspan fill="#82aaff"> Lesson</tspan><tspan fill="#d6e4f0">() {'{'}</tspan></text>
        <text x="48" y="160" fill="#4d6b82">2</text>
        <text x="86" y="160"><tspan fill="#c792ea">const</tspan><tspan fill="#d6e4f0"> [done, setDone] =</tspan></text>
        <text x="48" y="184" fill="#4d6b82">3</text>
        <text x="102" y="184"><tspan fill="#82aaff">useState</tspan><tspan fill="#d6e4f0">(</tspan><tspan fill="#f78c6c">false</tspan><tspan fill="#d6e4f0">);</tspan></text>
        <text x="48" y="208" fill="#4d6b82">4</text>
        <text x="86" y="208"><tspan fill="#c792ea">return</tspan><tspan fill="#89ddff"> &lt;Video</tspan><tspan fill="#ffcb6b"> src</tspan><tspan fill="#d6e4f0">=</tspan><tspan fill="#c3e88d">"flexbox"</tspan><tspan fill="#89ddff"> /&gt;</tspan></text>
        <text x="48" y="232" fill="#4d6b82">5</text>
        <text x="102" y="232"><tspan fill="#89ddff">&lt;Quiz</tspan><tspan fill="#ffcb6b"> onPass</tspan><tspan fill="#d6e4f0">={'{'}setDone{'}'}</tspan><tspan fill="#89ddff"> /&gt;</tspan></text>
        <text x="48" y="256" fill="#4d6b82">6</text>
        <text x="70" y="256" fill="#d6e4f0">{'}'}</text>
      </g>
      <rect x="82" y="264" width="2" height="16" fill="#3fa9f5" className="hero-caret" />
    </g>

    {/* Lesson preview */}
    <g filter="url(#hero-shadow)">
      <rect x="250" y="196" width="280" height="200" rx="16" fill="#ffffff" />
      <rect x="250" y="196" width="280" height="30" rx="16" fill="#eef4f9" />
      <rect x="250" y="212" width="280" height="14" fill="#eef4f9" />
      <rect x="266" y="205" width="150" height="12" rx="6" fill="#d7e3ee" />
      <text x="268" y="250" fontSize="13" fontWeight="700" fill="#0b4b73" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>2.1  Flexbox Layout</text>
      <rect x="266" y="262" width="248" height="88" rx="10" fill="url(#hero-video)" />
      <circle cx="390" cy="306" r="20" fill="#ffffff" fillOpacity="0.92" />
      <path d="M384 296 L384 316 L400 306 Z" fill="#1d7fd1" />
      <rect x="266" y="364" width="248" height="8" rx="4" fill="#e3ebf2" />
      <rect x="266" y="364" width="170" height="8" rx="4" fill="#28a36a" />
      <text x="514" y="389" textAnchor="end" fontSize="11" fill="#5b7186" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>68% complete</text>
    </g>

    {/* Floating badges */}
    <g className="hero-float hero-float-a" filter="url(#hero-shadow)">
      <rect x="196" y="16" width="150" height="44" rx="22" fill="#ffffff" />
      <circle cx="220" cy="38" r="13" fill="#28a36a" />
      <path d="M213 38 l5 5 l9 -10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="240" y="43" fontSize="14" fontWeight="700" fill="#0d1f2d" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>Quiz passed</text>
    </g>
    <g className="hero-float hero-float-b" filter="url(#hero-shadow)">
      <rect x="40" y="340" width="156" height="44" rx="22" fill="#ffffff" />
      <text x="62" y="368" fontSize="17">🔥</text>
      <text x="88" y="367" fontSize="14" fontWeight="700" fill="#0d1f2d" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>3-day streak</text>
    </g>
    <g className="hero-float hero-float-a" filter="url(#hero-shadow)">
      <rect x="196" y="410" width="132" height="44" rx="22" fill="#ffffff" />
      <text x="216" y="437" fontSize="16">🏆</text>
      <text x="242" y="437" fontSize="14" fontWeight="700" fill="#0d1f2d" style={{ fontFamily: "system-ui, 'Segoe UI', sans-serif" }}>+20 pts</text>
    </g>

    {/* Mascot */}
    <image href={logo} x="396" y="56" width="150" height="150" className="hero-float hero-float-b" />
  </svg>
);
