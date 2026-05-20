// Odin terminal prototype — shared chrome helpers.

const REGIME_KEY = {
  "Calm":     { tone: "calm",      orb: "calm" },
  "Watch":    { tone: "watch",     orb: "watch" },
  "Risk-Off": { tone: "risk-off",  orb: "riskoff" },
  "Crisis":   { tone: "crisis",    orb: "crisis" },
  "Unknown":  { tone: "unknown",   orb: "unknown" },
};

function regimeMeta(word) {
  return REGIME_KEY[word] || REGIME_KEY["Unknown"];
}

function fmtPct(x, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  const sign = x > 0 ? "+" : "";
  return sign + x.toFixed(digits) + "%";
}

function fmtNum(x, digits = 2) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return Number(x).toFixed(digits);
}

function fmtInt(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  return Math.round(Number(x)).toLocaleString();
}

function fmtCompactUSD(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  const n = Number(x);
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9)  return (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6)  return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(0);
}

function fmtAge(isoLike) {
  if (!isoLike) return "—";
  const t = new Date(isoLike).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const m = Math.round(diffMs / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h";
  const d = Math.round(h / 24);
  if (d < 30) return d + "d";
  const mo = Math.round(d / 30);
  if (mo < 12) return mo + "mo";
  const y = Math.round(mo / 12);
  return y + "y";
}

function fmtDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function mountClock() {
  const el = document.getElementById("odin-clock");
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const utc = now.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" });
    el.textContent = utc + " UTC";
  };
  tick();
  setInterval(tick, 1000);
}

function mountMarketStatus() {
  // NYSE: 9:30 – 16:00 ET, Mon–Fri (loose check, ignores holidays).
  const el = document.getElementById("market-state");
  if (!el) return;
  const tick = () => {
    const now = new Date();
    // Convert to ET via the US/Eastern locale's offset string. Cheap & good enough.
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = et.getDay(); // 0=Sun
    const mins = et.getHours() * 60 + et.getMinutes();
    let label = "CLOSED";
    let cls = "down";
    if (day >= 1 && day <= 5) {
      if (mins >= 570 && mins < 960) { label = "OPEN"; cls = "moss"; }
      else if (mins >= 240 && mins < 570) { label = "PRE";  cls = "muted"; }
      else if (mins >= 960 && mins < 1200) { label = "POST"; cls = "muted"; }
    }
    el.textContent = label;
    el.className = "v " + cls;
  };
  tick();
  setInterval(tick, 30000);
}

function loadJSON(path) {
  return fetch(path + "?v=" + Date.now()).then(r => {
    if (!r.ok) throw new Error("not found");
    return r.json();
  });
}

function escapeHTML(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  mountClock();
  mountMarketStatus();
});
