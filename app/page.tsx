"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RateCard { icon: string; type: string; vehicle: string; rate: string; category: "heavy"|"medium"|"light"; }
interface WhyCard { icon: string; title: string; desc: string; }
interface ServiceCard { num: string; title: string; desc: string; }
interface Step { num: string; title: string; desc: string; }
interface ContactInfo { icon: string; label: string; value: string; sub: string; }

// ─── Data ────────────────────────────────────────────────────────────────────

const RATES: RateCard[] = [
  { icon:"🚛", type:"Dry Van",     vehicle:"Dry Van",     rate:"$2.50 – $3.00", category:"heavy"  },
  { icon:"🚚", type:"Flatbed",     vehicle:"Flatbed",     rate:"$2.50 – $3.00", category:"heavy"  },
  { icon:"🚚", type:"Step Deck",   vehicle:"Step Deck",   rate:"$2.50 – $3.00", category:"heavy"  },
  { icon:"🛻", type:"Hotshot",     vehicle:"Hotshot",     rate:"$1.50 – $2.00", category:"medium" },
  { icon:"📦", type:"Box Truck",   vehicle:"Box Truck",   rate:"$1.50 – $2.00", category:"medium" },
  { icon:"🚐", type:"Sprinter Van",vehicle:"Sprinter Van",rate:"$0.80 – $0.90", category:"light"  },
];

const WHY_CARDS: WhyCard[] = [
  { icon:"🎯", title:"Top-Paying Loads",        desc:"We negotiate aggressively on your behalf to secure best rates per mile, market knowledge that keeps money in your pocket." },
  { icon:"📞", title:"24/7 Dispatch Support",   desc:"Day or night, weekends or holidays. Breakdowns, reroutes, emergencies, our team is always on standby for you." },
  { icon:"📋", title:"Full Paperwork Handling", desc:"Rate confirmations, BOLs, check calls, broker communication, all documentation managed so you can keep rolling." },
  { icon:"📈", title:"Market Rate Intelligence",desc:"We monitor spot rates and lane data in real time. Your rates move with the market. Always competitive, always current." },
  { icon:"🤝", title:"Commission-Only Model",   desc:"We only get paid when you get paid. Zero flat fees, zero surprises. Pure alignment, your profit is our profit." },
  { icon:"🗺️", title:"Nationwide Network",      desc:"All 48 contiguous states. Thousands of vetted brokers and shippers across every major freight corridor in the USA." },
];

const SERVICES: ServiceCard[] = [
  { num:"01", title:"Load Board Management",    desc:"We monitor DAT, Truckstop, and other major boards around the clock, finding the highest-paying loads matching your equipment." },
  { num:"02", title:"Rate Negotiation",         desc:"Our experienced dispatchers negotiate directly with freight brokers to maximize your per-mile rate on every single load." },
  { num:"03", title:"Paperwork & Documentation",desc:"Rate confirmations, bill of lading, check calls, and carrier packets. All the back-office work handled seamlessly." },
  { num:"04", title:"Broker Relations",         desc:"Strong relationships with hundreds of vetted freight brokers nationwide, giving you access to premium loads first." },
  { num:"05", title:"Route & Lane Planning",    desc:"Strategic lane selection to keep you loaded, reduce deadhead miles, and maximize profitability based on your home base." },
  { num:"06", title:"24/7 Driver Support",      desc:"On-the-road issues don't wait for business hours. Breakdown support, load cancellations, rerouting, we are always here." },
];

const STEPS: Step[] = [
  { num:"01", title:"Sign Up",       desc:"Fill out our quick onboarding form with your truck type, MC number, preferred lanes and contact info. Up in under 24 hours." },
  { num:"02", title:"We Find Loads", desc:"Our dispatchers immediately begin sourcing top-paying loads on major boards and through our broker network." },
  { num:"03", title:"You Approve",   desc:"We present load options for your approval. You stay in control, we execute only what you agree to. Full transparency." },
  { num:"04", title:"Get Paid",      desc:"Deliver the load, collect payment. We handle the paperwork end-to-end. Commission deducted only after you are paid." },
];

const CONTACT_INFO: ContactInfo[] = [
  { icon:"📍", label:"Our Office",    value:"Jefferson St, Manchester",    sub:"NH 03101, United States" },
  { icon:"🇺🇸", label:"Service Area", value:"All 48 Contiguous States",    sub:"Nationwide Dispatch Coverage" },
  { icon:"⏰", label:"Availability",  value:"24 Hours / 7 Days a Week",    sub:"365 Days a Year" },
  { icon:"💼", label:"Business Model",value:"Commission-Based Only",       sub:"No Upfront or Hidden Fees" },
];

// ─── useInView ────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── ScrollTruck (bottom bar) ────────────────────────────────────────────────

function ScrollTruck({ dark }: { dark: boolean }) {
  const [progress,  setProgress]  = useState(0);
  const [goingDown, setGoingDown] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const sy  = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setGoingDown(sy >= lastY.current);
      lastY.current = sy;
      setProgress(max > 0 ? Math.min(1, Math.max(0, sy / max)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const TW = 68;
  const dc = dark ? "#1e2330" : "#cbd5e1";
  const pc = dark ? "#262d40" : "#94a3b8";
  const wc = dark ? "#1f2937" : "#374151";
  const mc = dark ? "#4b5563" : "#64748b";

  // Truck always faces RIGHT (scroll-down). When scrolling up we flip the
  // entire wrapper with scaleX(-1). To stop the text mirroring we counter-flip
  // the text group inside the SVG around its own center.
  const truckLeft = `calc(${progress * 100}% - ${progress * TW}px)`;
  // Counter-transform applied to text group so it always reads left→right.
  // SVG is 68 wide; pivot at x=17 (center of trailer label area).
  // When goingDown: no counter needed. When goingUp (scaleX -1 on wrapper):
  // we flip the text group around x=17: translate(34,0) scale(-1,1)
  const textFlip = goingDown ? "" : "translate(34,0) scale(-1,1)";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" aria-hidden="true">
      {/* progress track */}
      <div className="relative h-[3px] w-full"
        style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
        <div className="absolute left-0 top-0 h-full bg-blue-500"
          style={{ width: `${progress * 100}%`, opacity: 0.65, transition: "width 0.05s linear" }} />
      </div>

      {/* truck, scaleX flip for direction, text counter-flipped inside */}
      <div
        className="absolute"
        style={{
          bottom: 3,
          left: truckLeft,
          width: TW,
          height: 30,
          transition: "left 0.05s linear",
          transform: `scaleX(${goingDown ? 1 : -1})`,
          transformOrigin: "center center",
          filter: dark
            ? "drop-shadow(0 0 6px rgba(59,130,246,0.55))"
            : "drop-shadow(0 0 5px rgba(59,130,246,0.45))",
        }}
      >
        {/*
          Side-view semi truck facing RIGHT.
          Trailer on the LEFT (x=0..36), cab on the RIGHT (x=36..68).

          CAB shape (correct semi proportions):
            - BACK: tall sleeper box  x=36..44, full height y=2..22
            - WINDSHIELD: slopes from top of sleeper down to low hood
              path: (44,2) → (56,2) → (62,9) → (44,9)
            - HOOD: low flat nose  x=62..68, y=9..22
            - HEADLIGHT at nose x≈67, y≈13
          This gives: tall back → sloped windshield → low hood front ✓
        *)
        */}
        <svg viewBox="0 0 68 30" fill="none" xmlns="http://www.w3.org/2000/svg" width={TW} height={30}>

          {/* ── TRAILER ── */}
          <rect x="1" y="3" width="34" height="17" rx="1.5" fill={dc} />
          <rect x="1" y="3"    width="34" height="1.5" rx="0.5" fill={pc} />
          <rect x="1" y="18.5" width="34" height="1.5" rx="0.5" fill={pc} />
          {[9,17,25].map(x => (
            <line key={x} x1={x} y1="4.5" x2={x} y2="18" stroke={pc} strokeWidth="0.6"/>
          ))}
          {/* container box */}
          <rect x="2" y="4" width="30" height="13" rx="1" fill={dark?"#111827":"#e2e8f0"} />
          <rect x="2" y="4" width="30" height="3.5" rx="0.5" fill={dark?"#0d0f14":"#dbeafe"} opacity="0.8"/>
          {/* AK LOGISTICS, counter-flip group so text never mirrors */}
          <g transform={textFlip}>
            <text x="17" y="13" textAnchor="middle" fontSize="3" fontWeight="800"
              fontFamily="'Oswald',sans-serif" fill="#3b82f6" letterSpacing="0.4">AK LOGISTICS</text>
          </g>
          {/* tail lights on rear of trailer (left side x=1) */}
          <rect x="1" y="4"  width="2" height="4" rx="0.4" fill="#ef4444" opacity="0.9" />
          <rect x="1" y="14" width="2" height="3" rx="0.4" fill="#fbbf24" opacity="0.8" />

          {/* ── CHASSIS ── */}
          <rect x="1" y="20" width="46" height="2" rx="0.8" fill={dark?"#374151":"#94a3b8"} />
          {/* fifth wheel */}
          <rect x="32" y="18.5" width="6" height="3" rx="1" fill={mc} />

          {/* ── CAB ── */}
          {/* Sleeper box, TALL back of cab */}
          <rect x="36" y="2" width="8" height="20" rx="1.5" fill="#2563eb" />
          {/* exhaust stack behind cab (left side of sleeper) */}
          <rect x="38" y="0" width="2.5" height="5" rx="1" fill={mc} />
          {/* main cab body */}
          <rect x="36" y="2" width="28" height="20" rx="1.5" fill="#3b82f6" />
          {/* Windshield slope: tall at back (x=44,y=2), drops to hood level (x=62,y=9) */}
          <path d="M44 2 L56 2 L62 9 L44 9 Z" fill="#bae6fd" opacity="0.88" />
          <line x1="46" y1="3" x2="48" y2="9" stroke="white" strokeWidth="0.7" strokeOpacity="0.4"/>
          {/* Sleeper front face (re-draw over cab body) */}
          <rect x="36" y="2" width="8" height="20" rx="1" fill="#2563eb" />
          {/* Door line */}
          <line x1="52" y1="9" x2="52" y2="22" stroke="#1d4ed8" strokeWidth="0.7"/>
          {/* Door handle */}
          <rect x="53" y="15" width="3" height="1.5" rx="0.7" fill="#fed7aa" />
          {/* Side mirror on back of cab */}
          <rect x="36" y="7" width="3" height="2" rx="0.8" fill={mc} />
          {/* Hood, LOW flat nose */}
          <rect x="62" y="9" width="5" height="13" rx="1" fill="#2563eb" />
          {/* Headlight at nose */}
          <rect x="65" y="13" width="2" height="4" rx="0.5" fill="#fef3c7" />
          {/* Grille lines */}
          {[15,17,19].map(y => (
            <line key={y} x1="63" y1={y} x2="65" y2={y} stroke="#1e40af" strokeWidth="0.6"/>
          ))}

          {/* ── WHEELS ── */}
          <circle cx="10" cy="24.5" r="4.5" fill={wc} />
          <circle cx="10" cy="24.5" r="2.5" fill={dark?"#374151":"#4b5563"} />
          <circle cx="10" cy="24.5" r="1"   fill={dark?"#4b5563":"#64748b"} />

          <circle cx="21" cy="24.5" r="4.5" fill={wc} />
          <circle cx="21" cy="24.5" r="2.5" fill={dark?"#374151":"#4b5563"} />
          <circle cx="21" cy="24.5" r="1"   fill={dark?"#4b5563":"#64748b"} />

          <circle cx="44" cy="24.5" r="4.5" fill={wc} />
          <circle cx="44" cy="24.5" r="2.5" fill={dark?"#374151":"#4b5563"} />
          <circle cx="44" cy="24.5" r="1"   fill={dark?"#4b5563":"#64748b"} />

          <circle cx="60" cy="24.5" r="4"   fill={wc} />
          <circle cx="60" cy="24.5" r="2.2" fill={dark?"#374151":"#4b5563"} />
          <circle cx="60" cy="24.5" r="0.9" fill={dark?"#4b5563":"#64748b"} />
        </svg>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-0.5 bg-blue-500 block"/>
      <span className="text-blue-500 text-xs font-bold tracking-[0.2em] uppercase">{label}</span>
    </div>
  );
}

function RevealDiv({ children, className="", delay=0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView?"opacity-100 translate-y-0":"opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay:`${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ dark, onToggle }: { dark: boolean; onToggle: ()=>void }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Services","Rates","Coverage","Process","Contact"];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? dark ? "bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-xl shadow-xl"
              : "bg-white/90 border-b border-zinc-200 backdrop-blur-xl shadow-sm"
      : "bg-transparent"}`}>
      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-10 xl:px-16 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 flex items-center justify-center text-white font-black text-sm tracking-wider flex-shrink-0"
            style={{ clipPath:"polygon(0 25%, 35% 0, 100% 0, 100% 75%, 65% 100%, 0 100%)" }}>AK</div>
          <div className="flex flex-col leading-none">
            <span className={`font-black text-base tracking-widest uppercase ${dark?"text-white":"text-zinc-900"}`}>AK Logistics</span>
            <span className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase">Solutions</span>
          </div>
        </a>
        <ul className="hidden md:flex items-center gap-8">
          {links.map(l=>(
            <li key={l}>
              <button onClick={()=>{ const el=document.getElementById(l.toLowerCase()); if(el) el.scrollIntoView({behavior:"smooth"}); }}
                className={`text-xs font-semibold tracking-[0.14em] uppercase transition-colors hover:text-blue-500 bg-transparent border-none cursor-pointer ${dark?"text-zinc-400":"text-zinc-500"}`}>{l}</button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button onClick={onToggle} aria-label="Toggle theme"
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 hover:border-blue-500 hover:text-blue-500 ${dark?"bg-zinc-800 border-zinc-700 text-zinc-300":"bg-zinc-100 border-zinc-300 text-zinc-600"}`}>
            {dark
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button onClick={()=>{ const el=document.getElementById("contact"); if(el) el.scrollIntoView({behavior:"smooth"}); }}
            className="hidden md:inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 border-none cursor-pointer">Get Started</button>
          <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={()=>setMenuOpen(!menuOpen)}>
            {[0,1,2].map(i=>(
              <span key={i} className={`block w-5 h-0.5 transition-all duration-300 ${dark?"bg-white":"bg-zinc-900"} ${menuOpen&&i===0?"rotate-45 translate-y-2":""} ${menuOpen&&i===1?"opacity-0":""} ${menuOpen&&i===2?"-rotate-45 -translate-y-2":""}`}/>
            ))}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className={`md:hidden border-t px-6 py-5 flex flex-col gap-4 ${dark?"bg-zinc-950 border-zinc-800":"bg-white border-zinc-200"}`}>
          {links.map(l=>(
            <button key={l} onClick={()=>{ setMenuOpen(false); const el=document.getElementById(l.toLowerCase()); if(el) el.scrollIntoView({behavior:"smooth"}); }}
              className={`text-sm font-semibold tracking-widest uppercase hover:text-blue-500 transition-colors text-left bg-transparent border-none cursor-pointer ${dark?"text-zinc-300":"text-zinc-600"}`}>{l}</button>
          ))}
          <button onClick={()=>{ setMenuOpen(false); const el=document.getElementById("contact"); if(el) el.scrollIntoView({behavior:"smooth"}); }}
            className="bg-blue-500 text-white text-xs font-bold tracking-widest uppercase px-5 py-3 rounded text-center">Get Started</button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ dark }: { dark: boolean }) {
  return (
    <section id="home" className={`relative min-h-screen flex items-center overflow-hidden pt-16 ${dark?"bg-zinc-950":"bg-slate-50"}`}>
      {/* Dot grid, visible on all devices, no glow */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dark ? "#94a3b8" : "#94a3b8"} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0",
          opacity: dark ? 0.25 : 0.22,
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 py-20">
        <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl">
          <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-sm mb-8">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6] animate-pulse"/>
            Nationwide Dispatch Services, All 48 States
          </div>
          <h1 className={`font-black tracking-tight mb-6 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(3.5rem,8vw,10rem)", fontFamily:"'Oswald',sans-serif", fontWeight:800, lineHeight:1 }}>
            <span className="block">MOVE</span>
            <span className="block text-blue-500" style={{ lineHeight:1 }}>FREIGHT</span>
            <span className="block">ACROSS USA</span>
          </h1>
          <p className={`text-lg font-light leading-relaxed mb-10 max-w-lg ${dark?"text-zinc-400":"text-zinc-500"}`}>
            AK Logistics Solutions connects carriers with top-paying loads across all 48 states. Professional dispatch, maximum miles, maximum earnings, all commission-only.
          </p>
          <div className="flex flex-
