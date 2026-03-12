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
          <div className="flex flex-wrap gap-4 mb-14">
            <button onClick={()=>{ const el=document.getElementById("contact"); if(el) el.scrollIntoView({behavior:"smooth"}); }}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/30 border-none cursor-pointer">
              Start Dispatching
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={()=>{ const el=document.getElementById("rates"); if(el) el.scrollIntoView({behavior:"smooth"}); }}
              className={`inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase px-8 py-4 rounded border-2 transition-all duration-200 hover:-translate-y-1 border-none cursor-pointer ${dark?"border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-500":"border-zinc-300 text-zinc-600 hover:border-blue-500 hover:text-blue-500"}`}
              style={{ border: dark ? "2px solid #3f3f46" : "2px solid #d1d5db" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.border="2px solid #3b82f6"; (e.currentTarget as HTMLButtonElement).style.color="#3b82f6"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.border=dark?"2px solid #3f3f46":"2px solid #d1d5db"; (e.currentTarget as HTMLButtonElement).style.color=""; }}>
              View Rates
            </button>
          </div>
          <div className="flex flex-wrap gap-10 xl:gap-16">
            {[["48+","States Covered"],["6","Truck Types"],["24/7","Support"],["0%","Upfront Fees"]].map(([n,l])=>(
              <div key={l} className="flex flex-col gap-1">
                <span className="text-blue-500 font-black leading-none" style={{ fontSize:"2.2rem", fontFamily:"'Oswald',sans-serif" }}>{n}</span>
                <span className={`text-[11px] font-bold tracking-[0.18em] uppercase ${dark?"text-zinc-500":"text-zinc-400"}`}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${dark?"bg-gradient-to-t from-zinc-950 to-transparent":"bg-gradient-to-t from-slate-50 to-transparent"}`}/>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

function MarqueeBanner() {
  const items = ["Dry Van","Flatbed","Step Deck","Hotshot","Box Truck","Sprinter Van","Nationwide Coverage","24/7 Dispatch","Commission Based"];
  return (
    <div className="bg-blue-500 overflow-hidden py-3">
      <div className="flex whitespace-nowrap" style={{ animation:"marquee 24s linear infinite" }}>
        {[...items,...items].map((item,i)=>(
          <span key={i} className="inline-flex items-center gap-4 text-white font-black text-sm tracking-[0.15em] uppercase px-8">
            {item}<span className="text-white/50 text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function WhyUs({ dark }: { dark: boolean }) {
  return (
    <section id="services" className={`py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-950":"bg-white"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <RevealDiv>
          <SectionTag label="Why Choose Us"/>
          <h2 className={`font-black leading-[0.92] tracking-tight mb-4 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>
            YOUR SUCCESS<br/>IS OUR BUSINESS
          </h2>
          <p className={`text-base font-light leading-relaxed max-w-xl mb-16 ${dark?"text-zinc-400":"text-zinc-500"}`}>
            We handle load boards so you can focus on the road. Professional dispatch with a personal touch.
          </p>
        </RevealDiv>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/20 rounded-xl overflow-hidden border border-zinc-200/10 xl:grid-cols-3">
          {WHY_CARDS.map((c,i)=>(
            <RevealDiv key={c.title} delay={i*70}>
              <div className={`group p-8 h-full relative overflow-hidden transition-all duration-300 ${dark?"bg-zinc-900 hover:bg-zinc-800/80":"bg-zinc-50 hover:bg-white"}`}>
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"/>
                <span className="text-3xl mb-5 block">{c.icon}</span>
                <h3 className={`font-bold text-base tracking-wide uppercase mb-3 ${dark?"text-white":"text-zinc-900"}`}>{c.title}</h3>
                <p className={`text-sm font-light leading-relaxed ${dark?"text-zinc-400":"text-zinc-500"}`}>{c.desc}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rates({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<string|null>(null);
  return (
    <section id="rates" className={`py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-900":"bg-slate-50"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid lg:grid-cols-2 xl:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_500px] gap-10 xl:gap-16 items-start mb-16">
          <RevealDiv>
            <SectionTag label="Pricing Structure"/>
            <h2 className={`font-black leading-[0.92] tracking-tight mb-4 ${dark?"text-white":"text-zinc-900"}`}
              style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>
              TRANSPARENT<br/>RATE CARDS
            </h2>
            <p className={`text-base font-light leading-relaxed max-w-lg ${dark?"text-zinc-400":"text-zinc-500"}`}>
              Competitive rates per mile for every truck type. Rates vary with customer preferences, lane conditions, and market trends.
            </p>
          </RevealDiv>
          <RevealDiv delay={100}>
            <div className={`rounded-xl border p-8 ${dark?"bg-zinc-800 border-zinc-700":"bg-white border-zinc-200"}`}>
              <p className={`text-[11px] font-bold tracking-[0.2em] uppercase mb-2 ${dark?"text-zinc-500":"text-zinc-400"}`}>Our Fee Structure</p>
              <p className="text-blue-500 font-black text-4xl xl:text-5xl mb-3" style={{ fontFamily:"'Oswald',sans-serif" }}>Commission Based</p>
              <p className={`text-sm font-light leading-relaxed ${dark?"text-zinc-400":"text-zinc-500"}`}>
                No upfront fees, we earn only when you earn. Goals fully aligned with yours.
              </p>
              <div className={`mt-5 pt-5 border-t flex flex-wrap gap-4 ${dark?"border-zinc-700":"border-zinc-100"}`}>
                {["No Setup Fee","No Monthly Fee","Pay on Delivery"].map(t=>(
                  <div key={t} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
                    <span className={`text-xs font-semibold ${dark?"text-zinc-400":"text-zinc-500"}`}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 2xl:gap-8">
          {RATES.map((c,i)=>{
            const isSelected = selected === c.type;
            return (
              <RevealDiv key={c.type} delay={i*60}>
                <div
                  onClick={()=>setSelected(isSelected ? null : c.type)}
                  className={`group rounded-xl border p-6 xl:p-8 transition-all duration-200 cursor-pointer hover:-translate-y-1
                    ${isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/40 " + (dark ? "bg-zinc-800 shadow-2xl shadow-blue-500/20" : "bg-white shadow-xl shadow-blue-500/15")
                      : dark
                        ? "bg-zinc-800 border-zinc-700 hover:border-blue-500 hover:shadow-2xl hover:shadow-black/40"
                        : "bg-white border-zinc-200 hover:border-blue-500 hover:shadow-xl"
                    }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-2 h-2 rounded-full bg-blue-500 ${isSelected ? "shadow-[0_0_8px_#3b82f6]" : "shadow-[0_0_6px_#3b82f6]"}`}/>
                    <span className={`text-[10px] font-bold tracking-[0.18em] uppercase ${dark?"text-zinc-500":"text-zinc-400"}`}>{c.type}</span>

                  </div>
                  <div className="text-2xl mb-3">{c.icon}</div>
                  <p className={`font-bold text-lg uppercase tracking-wide mb-3 ${dark?"text-white":"text-zinc-900"}`}>{c.vehicle}</p>
                  <p className="text-blue-500 font-black text-3xl leading-none mb-1" style={{ fontFamily:"'Oswald',sans-serif" }}>{c.rate}</p>
                  <p className={`text-[11px] font-semibold tracking-widest uppercase ${dark?"text-zinc-500":"text-zinc-400"}`}>Per Mile</p>
                  <p className={`text-xs italic mt-3 ${dark?"text-zinc-600":"text-zinc-400"}`}>Rate may vary with market conditions</p>
                </div>
              </RevealDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services({ dark }: { dark: boolean }) {
  return (
    <section className={`py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-950":"bg-white"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <RevealDiv>
          <SectionTag label="Our Services"/>
          <h2 className={`font-black leading-[0.92] tracking-tight mb-4 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>
            FULL-SERVICE<br/>DISPATCH
          </h2>
          <p className={`text-base font-light leading-relaxed max-w-xl mb-16 ${dark?"text-zinc-400":"text-zinc-500"}`}>
            From load hunting to final delivery paperwork, we manage every step with precision.
          </p>
        </RevealDiv>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s,i)=>(
            <RevealDiv key={s.num} delay={i*60}>
              <div className={`group rounded-xl border p-7 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 ${dark?"bg-zinc-900 border-zinc-800 hover:shadow-2xl hover:shadow-black/30":"bg-slate-50 border-zinc-200 hover:bg-white hover:shadow-xl"}`}>
                <span className={`font-black text-5xl leading-none transition-colors duration-300 ${dark?"text-zinc-800 group-hover:text-blue-500/40":"text-zinc-200 group-hover:text-blue-400/40"}`}
                  style={{ fontFamily:"'Oswald',sans-serif" }}>{s.num}</span>
                <h3 className={`font-bold text-base tracking-wide uppercase ${dark?"text-white":"text-zinc-900"}`}>{s.title}</h3>
                <p className={`text-sm font-light leading-relaxed flex-1 ${dark?"text-zinc-400":"text-zinc-500"}`}>{s.desc}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

function USAMap({ dark }: { dark: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load real US Atlas TopoJSON + topojson-client from CDN, then render
    const loadScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => res();
        s.onerror = () => rej();
        document.head.appendChild(s);
      });

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"),
    ])
    .then(() => fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"))
    .then(r => r.json())
    .then((us: any) => {
      const topoJson = (window as any).topojson;
      if (!topoJson || !svgRef.current) return;

      const W = 960, H = 600;
      const projection = d3.geoAlbersUsa().scale(1280).translate([W / 2, H / 2]);
      const pathGen = d3.geoPath().projection(projection);

      const states = topoJson.feature(us, us.objects.states);
      const borders = topoJson.mesh(us, us.objects.states, (a: any, b: any) => a !== b);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Background glow blob
      const defs = svg.append("defs");
      const grad = defs.append("radialGradient").attr("id", "mapGlow").attr("cx","50%").attr("cy","50%").attr("r","50%");
      grad.append("stop").attr("offset","0%").attr("stop-color", dark ? "#1e40af" : "#3b82f6").attr("stop-opacity", dark ? 0.12 : 0.08);
      grad.append("stop").attr("offset","100%").attr("stop-color", dark ? "#1e40af" : "#3b82f6").attr("stop-opacity", 0);

      const stateGrad = defs.append("linearGradient").attr("id","stFill").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","100%");
      stateGrad.append("stop").attr("offset","0%").attr("stop-color", dark ? "#1e3a5f" : "#dbeafe");
      stateGrad.append("stop").attr("offset","100%").attr("stop-color", dark ? "#172554" : "#bfdbfe");

      const filt = defs.append("filter").attr("id","dotGlow");
      filt.append("feGaussianBlur").attr("stdDeviation","3").attr("result","blur");
      const merge = filt.append("feMerge");
      merge.append("feMergeNode").attr("in","blur");
      merge.append("feMergeNode").attr("in","SourceGraphic");

      // Glow ellipse behind map
      svg.append("ellipse")
        .attr("cx", W/2).attr("cy", H/2)
        .attr("rx", 380).attr("ry", 240)
        .attr("fill", "url(#mapGlow)");

      // State fills
      svg.append("g")
        .selectAll("path")
        .data((states as any).features)
        .join("path")
        .attr("d", (d: any) => pathGen(d) || "")
        .attr("fill", "url(#stFill)")
        .attr("stroke", dark ? "#1d4ed8" : "#93c5fd")
        .attr("stroke-width", "0.6")
        .attr("stroke-linejoin", "round")
        .style("transition", "fill 0.3s")
        .on("mouseenter", function() {
          d3.select(this).attr("fill", dark ? "#1e40af" : "#93c5fd");
        })
        .on("mouseleave", function() {
          d3.select(this).attr("fill", "url(#stFill)");
        });

      // State borders
      svg.append("path")
        .datum(borders)
        .attr("d", pathGen as any)
        .attr("fill", "none")
        .attr("stroke", dark ? "#2563eb" : "#60a5fa")
        .attr("stroke-width", "0.8")
        .attr("stroke-linejoin", "round");

      // Hub city pulse dots
      const hubs = [
        { name:"LA",    coords:[-118.2437, 34.0522] },
        { name:"CHI",   coords:[-87.6298,  41.8781] },
        { name:"NYC",   coords:[-74.006,   40.7128] },
        { name:"DAL",   coords:[-96.797,   32.7767] },
        { name:"ATL",   coords:[-84.388,   33.749]  },
        { name:"DEN",   coords:[-104.991,  39.7392] },
        { name:"SEA",   coords:[-122.332,  47.6062] },
        { name:"MIA",   coords:[-80.1918,  25.7617] },
      ];

      hubs.forEach((hub, i) => {
        const pos = projection(hub.coords as [number, number]);
        if (!pos) return;
        const [x, y] = pos;
        const g = svg.append("g");

        // Outer ripple
        const circle = g.append("circle")
          .attr("cx", x).attr("cy", y)
          .attr("r", 4)
          .attr("fill", "#3b82f6")
          .attr("opacity", 0.3)
          .attr("filter", "url(#dotGlow)");

        const animate = () => {
          circle.attr("r", 4).attr("opacity", 0.3)
            .transition().duration(1800).delay(i * 220)
            .attr("r", 14).attr("opacity", 0)
            .on("end", animate);
        };
        animate();

        // Core dot
        g.append("circle")
          .attr("cx", x).attr("cy", y)
          .attr("r", 3)
          .attr("fill", "#3b82f6")
          .attr("filter", "url(#dotGlow)");
      });

      setLoaded(true);
    })
    .catch(console.error);
  }, [dark]);

  return (
    <div className="relative w-full" style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.6s" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 960 600"
        className="w-full h-auto"
        style={{ filter: dark ? "drop-shadow(0 0 40px rgba(59,130,246,0.15))" : "drop-shadow(0 8px 40px rgba(59,130,246,0.12))" }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}
    </div>
  );
}

function Coverage({ dark }: { dark: boolean }) {
  const regions = ["Northeast","Southeast","Midwest","Southwest","Mountain West","Pacific Coast","Gulf Coast","Great Plains"];
  return (
    <section id="coverage" className={`py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-900":"bg-slate-50"}`}>
      <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">
        <RevealDiv>
          <SectionTag label="Coverage Area"/>
          <h2 className={`font-black leading-[0.92] tracking-tight mb-5 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>
            ALL 48<br/>STATES
          </h2>
          <p className={`text-base font-light leading-relaxed max-w-lg mb-8 ${dark?"text-zinc-400":"text-zinc-500"}`}>
            No lane too long, no region too remote. We cover the entire contiguous United States.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {regions.map(r=>(
              <span key={r} className="bg-blue-500/10 border border-blue-500/25 text-blue-500 text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-sm">{r}</span>
            ))}
          </div>
          <button onClick={()=>{ const el=document.getElementById("contact"); if(el) el.scrollIntoView({behavior:"smooth"}); }} className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm tracking-widest uppercase px-8 py-4 rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 border-none cursor-pointer">Book Your Lane →</button>
        </RevealDiv>
        <RevealDiv delay={150} className="flex items-center justify-center w-full">
          <div className="w-full max-w-2xl xl:max-w-3xl mx-auto">
            <USAMap dark={dark}/>
          </div>
        </RevealDiv>
      </div>
    </section>
  );
}

function Process({ dark }: { dark: boolean }) {
  return (
    <section id="process" className={`py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-950":"bg-white"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <RevealDiv>
          <SectionTag label="Process"/>
          <h2 className={`font-black leading-[0.92] tracking-tight mb-4 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>HOW IT WORKS</h2>
          <p className={`text-base font-light leading-relaxed max-w-xl mb-16 ${dark?"text-zinc-400":"text-zinc-500"}`}>Four steps and you are on the road earning maximum.</p>
        </RevealDiv>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-10 relative">
          <div className={`absolute top-7 left-[12.5%] right-[12.5%] h-px hidden lg:block ${dark?"bg-zinc-800":"bg-zinc-200"}`}/>
          {STEPS.map((s,i)=>(
            <RevealDiv key={s.num} delay={i*80}>
              <div className="group flex flex-col gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:shadow-xl group-hover:shadow-blue-500/30 ${dark?"bg-zinc-950 border-zinc-700 text-blue-500":"bg-white border-zinc-300 text-blue-500"}`}>
                  <span className="font-black text-xl" style={{ fontFamily:"'Oswald',sans-serif" }}>{s.num}</span>
                </div>
                <h3 className={`font-bold text-base tracking-wide uppercase transition-colors duration-300 group-hover:text-blue-500 ${dark?"text-white":"text-zinc-900"}`}>{s.title}</h3>
                <p className={`text-sm font-light leading-relaxed ${dark?"text-zinc-400":"text-zinc-500"}`}>{s.desc}</p>
              </div>
            </RevealDiv>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAILJS CREDENTIALS — replace these 3 values with yours from emailjs.com
// 1. Sign up at https://emailjs.com (free — 200 emails/month)
// 2. Add New Service → Gmail → connect your Gmail account
// 3. Create Email Template — use variables: {{first_name}} {{last_name}}
//    {{email}} {{phone}} {{truck_type}} {{message}}
// 4. Paste your Service ID, Template ID, Public Key below
// ─────────────────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xyz456"
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // e.g. "aBcDef123456"

function Contact({ dark }: { dark: boolean }) {
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [truck,  setTruck]  = useState("");
  const [form,   setForm]   = useState({ firstName:"", lastName:"", email:"", phone:"", message:"" });

  const ic = `w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200 border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${dark?"bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600":"bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"}`;
  const lc = `text-[10px] font-bold tracking-[0.18em] uppercase ${dark?"text-zinc-500":"text-zinc-400"}`;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !truck) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setStatus("sending");
    try {
      if (!(window as any).emailjs) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
          s.onload = () => res();
          s.onerror = () => rej();
          document.head.appendChild(s);
        });
      }
      await (window as any).emailjs.send(
        EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
        { first_name: form.firstName, last_name: form.lastName, email: form.email,
          phone: form.phone || "Not provided", truck_type: truck, message: form.message || "No message" },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setForm({ firstName:"", lastName:"", email:"", phone:"", message:"" });
      setTruck("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section id="contact" className={`py-20 lg:py-28 px-6 lg:px-10 xl:px-16 2xl:px-24 ${dark?"bg-zinc-900":"bg-slate-50"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <RevealDiv>
          <SectionTag label="Get In Touch"/>
          <h2 className={`font-black leading-[0.92] tracking-tight mb-4 ${dark?"text-white":"text-zinc-900"}`}
            style={{ fontSize:"clamp(2.5rem,4vw,6rem)", fontFamily:"'Oswald',sans-serif" }}>READY TO ROLL?</h2>
          <p className={`text-base font-light leading-relaxed max-w-xl mb-16 ${dark?"text-zinc-400":"text-zinc-500"}`}>Solo owner-operator or fleet? We are ready to maximize your earnings.</p>
        </RevealDiv>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 xl:gap-16 items-start">
          <RevealDiv className="flex flex-col gap-6">
            {CONTACT_INFO.map(item=>(
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                <div>
                  <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-1 ${dark?"text-zinc-500":"text-zinc-400"}`}>{item.label}</p>
                  <p className={`text-sm font-medium ${dark?"text-white":"text-zinc-900"}`}>{item.value}</p>
                  <p className={`text-sm ${dark?"text-zinc-500":"text-zinc-400"}`}>{item.sub}</p>
                </div>
              </div>
            ))}
            <div className={`mt-4 p-6 rounded-xl border ${dark?"bg-zinc-800 border-zinc-700":"bg-white border-zinc-200"}`}>
              <p className={`text-[10px] font-bold tracking-widest uppercase mb-4 ${dark?"text-zinc-500":"text-zinc-400"}`}>Supported Truck Types</p>
              <div className="flex flex-wrap gap-2">
                {RATES.map(r=>(
                  <span key={r.type} className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold px-3 py-1.5 rounded-full">{r.icon} {r.vehicle}</span>
                ))}
              </div>
            </div>
          </RevealDiv>
          <RevealDiv delay={120}>
            <div className={`rounded-2xl border p-8 ${dark?"bg-zinc-800 border-zinc-700":"bg-white border-zinc-200"}`}>
              <h3 className={`font-bold text-xl tracking-wide uppercase mb-7 ${dark?"text-white":"text-zinc-900"}`}>Get Started Today</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className={lc}>First Name <span className="text-blue-500">*</span></label>
                  <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" className={ic}/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={lc}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Smith" className={ic}/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={lc}>Email <span className="text-blue-500">*</span></label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" className={ic}/>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={lc}>Phone</label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={ic}/>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={lc}>Truck Type <span className="text-blue-500">*</span></label>
                <select value={truck} onChange={e=>setTruck(e.target.value)} className={ic}>
                  <option value="" disabled>Select your truck type</option>
                  {RATES.map(r=><option key={r.type} value={r.type}>{r.icon} {r.vehicle}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={lc}>Message (Optional)</label>
                <textarea rows={3} value={form.message} onChange={set("message")} placeholder="Tell us about your operation, preferred lanes, fleet size..." className={ic}/>
              </div>
              {status === "error" && (
                <p className="text-red-400 text-xs font-semibold mb-3 tracking-wide">Please fill in First Name, Email, and Truck Type.</p>
              )}
              <button onClick={handleSubmit} disabled={status==="sending"||status==="success"}
                className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 border-none cursor-pointer
                  ${status==="success"?"bg-green-500 text-white cursor-default"
                  :status==="sending"?"bg-blue-400 text-white opacity-80 cursor-wait"
                  :"bg-blue-500 hover:bg-blue-400 text-white hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30"}`}>
                {status==="sending"?"Sending...":status==="success"?"✓ Request Sent! We Will Be In Touch.":"Send My Request →"}
              </button>
              <p className={`text-[10px] text-center mt-4 ${dark?"text-zinc-600":"text-zinc-400"}`}>We respond within 24 hours. No spam, ever.</p>
            </div>
          </RevealDiv>
        </div>
      </div>
    </section>
  );
}

function Footer({ dark }: { dark: boolean }) {
  return (
    <footer className={`border-t px-6 lg:px-10 xl:px-16 2xl:px-24 py-14 pb-20 ${dark?"bg-zinc-950 border-zinc-800":"bg-white border-zinc-200"}`}>
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-16 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 flex items-center justify-center text-white font-black text-sm tracking-wider"
                style={{ clipPath:"polygon(0 25%, 35% 0, 100% 0, 100% 75%, 65% 100%, 0 100%)" }}>AK</div>
              <div className="flex flex-col leading-none">
                <span className={`font-black text-base tracking-widest uppercase ${dark?"text-white":"text-zinc-900"}`}>AK Logistics</span>
                <span className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase">Solutions</span>
              </div>
            </div>
            <p className={`text-sm font-light leading-relaxed max-w-xs ${dark?"text-zinc-500":"text-zinc-400"}`}>
              Professional truck dispatch connecting carriers with top-paying freight across all 48 states.
            </p>
          </div>
          <div>
            <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${dark?"text-zinc-600":"text-zinc-400"}`}>Truck Types</p>
            <ul className="flex flex-col gap-2">
              {RATES.map(r=>(
                <li key={r.type}>
                  <button
                    onClick={()=>{ const el=document.getElementById("rates"); if(el) el.scrollIntoView({behavior:"smooth"}); }}
                    className={`text-sm transition-colors hover:text-blue-500 bg-transparent border-none cursor-pointer text-left ${dark?"text-zinc-500":"text-zinc-400"}`}>
                    {r.icon} {r.vehicle} Dispatch
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${dark?"text-zinc-600":"text-zinc-400"}`}>Company</p>
            <ul className="flex flex-col gap-2">
              {([
                ["Why Choose Us","whyus"],
                ["Our Rates","rates"],
                ["Coverage Area","coverage"],
                ["How It Works","process"],
                ["Contact Us","contact"],
              ] as [string,string][]).map(([label,id])=>(
                <li key={id}>
                  <button
                    onClick={()=>{ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth"}); }}
                    className={`text-sm transition-colors hover:text-blue-500 bg-transparent border-none cursor-pointer text-left ${dark?"text-zinc-500":"text-zinc-400"}`}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`border-t pt-6 flex flex-wrap justify-between items-center gap-4 ${dark?"border-zinc-800":"border-zinc-100"}`}>
          <p className={`text-xs ${dark?"text-zinc-600":"text-zinc-400"}`}>© 2025 <span className="text-blue-500 font-semibold">AK Logistics Solutions</span>. All rights reserved. · Jefferson St, Manchester, NH 03101</p>
          <p className={`text-xs ${dark?"text-zinc-600":"text-zinc-400"}`}>Built for the road. Built for carriers. 🚛</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AKLogisticsLanding() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const s = localStorage.getItem("ak-theme");
    if (s) setDark(s === "dark");
  }, []);
  const toggle = () => setDark(p => { const n=!p; localStorage.setItem("ak-theme",n?"dark":"light"); return n; });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Barlow', sans-serif; overflow-x: hidden; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @media (min-width: 2560px) {
          .max-w-\[1400px\] { max-width: 2200px !important; }
          section { padding-left: 4rem !important; padding-right: 4rem !important; }
        }
        @media (min-width: 3840px) {
          .max-w-\[1400px\] { max-width: 3200px !important; }
          section { padding-left: 8rem !important; padding-right: 8rem !important; }
          html { font-size: 20px; }
        }
      `}</style>
      <div className={dark?"dark":""}>
        <ScrollTruck dark={dark}/>
        <Navbar dark={dark} onToggle={toggle}/>
        <Hero dark={dark}/>
        <MarqueeBanner/>
        <WhyUs dark={dark}/>
        <Rates dark={dark}/>
        <Services dark={dark}/>
        <Coverage dark={dark}/>
        <Process dark={dark}/>
        <Contact dark={dark}/>
        <Footer dark={dark}/>
      </div>
    </>
  );
}
