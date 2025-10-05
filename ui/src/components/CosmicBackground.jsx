// src/components/CosmicBackground.jsx
import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

/**
 * Cinematic space backdrop:
 *  - Parallax stars (3 layers)
 *  - Procedural nebula (noise-based) with soft gradients
 *  - Black-hole vortex w/ slow rotating accretion ring + lensing fade
 *  - Rare meteor showers (tasteful)
 * Respects prefers-reduced-motion unless enableMotion=true.
 */
export default function CosmicBackground({
  density = 0.00045,   // stars per CSS px
  speed = 1,           // global motion multiplier
  meteorRate = 0.0016, // spawn probability per frame
  showVortex = true,
  enableMotion = false,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    let cssW = 0, cssH = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

    // Motion preference (live)
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = media.matches && !enableMotion;
    const onChange = () => { reduced = media.matches && !enableMotion; if (!reduced && !rafRef.current) loop(0); };
    media.addEventListener?.("change", onChange);

    // Resize observer
    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      buildStars();
      buildNebula();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ===== Stars (3 parallax layers)
    const layers = [
      { stars: [], depth: 0.33, vx: 0.006, vy: 0.004 },
      { stars: [], depth: 0.66, vx: 0.012, vy: 0.008 },
      { stars: [], depth: 1.00, vx: 0.020, vy: 0.014 },
    ];
    const rand = (a, b) => a + Math.random() * (b - a);

    function buildStars() {
      layers.forEach(l => (l.stars = []));
      const total = Math.max(140, Math.floor(cssW * cssH * density));
      const weights = [0.42, 0.38, 0.20];
      layers.forEach((layer, i) => {
        const count = Math.floor(total * weights[i]);
        for (let k = 0; k < count; k++) {
          layer.stars.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            r: rand(0.6, 1.6) * layer.depth,
            baseA: rand(0.25, 0.75),
            tw: rand(0.8, 1.6),
            phi: rand(0, Math.PI * 2),
            ox: rand(-12, 12) * (2 - layer.depth),
            oy: rand(-12, 12) * (2 - layer.depth),
            tint: Math.random(),
          });
        }
      });
    }

    // ===== Procedural nebula (offscreen)
    let nebulaCanvas, nebulaCtx, nebulaTime = 0;
    function buildNebula() {
      nebulaCanvas = document.createElement("canvas");
      nebulaCanvas.width = Math.max(1, Math.floor(cssW / 2));
      nebulaCanvas.height = Math.max(1, Math.floor(cssH / 2));
      nebulaCtx = nebulaCanvas.getContext("2d");
      paintNebula(nebulaCtx, nebulaCanvas.width, nebulaCanvas.height, 0);
    }

    // Tiny, fast value-noise (no external libs)
    function noise2D(x, y, seed = 43758.5453) {
      const s = Math.sin(x * 12.9898 + y * 78.233) * seed;
      return s - Math.floor(s);
    }
    function fbm(x, y) {
      let v = 0, amp = 0.6, frq = 1.0;
      for (let i = 0; i < 4; i++) {
        v += amp * noise2D(x * frq, y * frq);
        frq *= 2.03; amp *= 0.55;
      }
      return v;
    }
    function paintNebula(nctx, w, h, t) {
      const img = nctx.createImageData(w, h);
      let i = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w, ny = y / h;
          const v = fbm(nx * 2 + t * 0.02, ny * 2 + t * 0.02);
          // palette: deep blue -> violet -> cyan
          const c1 = (v * 255) | 0;
          const c2 = ((v * v) * 255) | 0;
          img.data[i++] = 40 + c2 * 0.2;       // R
          img.data[i++] = 80 + c1 * 0.35;      // G
          img.data[i++] = 160 + c1 * 0.55;     // B
          img.data[i++] = Math.min(255, (v * 160) | 0); // A
        }
      }
      nctx.putImageData(img, 0, 0);
    }

    // ===== Black-hole vortex params
    const vortex = {
      x: 0.6, y: 0.4, // normalized position
      r: 180,         // core radius (px at 1440p-ish)
      ringR: 320,     // accretion radius
      ringW: 28,      // ring thickness
      angle: 0,       // rotation
    };

    // ===== Meteors
    const meteors = [];
    function spawnMeteor() {
      if (Math.random() < meteorRate) {
        const fromTop = Math.random() < 0.55;
        const startX = fromTop ? rand(-cssW * 0.1, cssW * 0.25) : rand(cssW * 0.75, cssW * 1.1);
        const startY = fromTop ? rand(-cssH * 0.1, cssH * 0.2) : rand(cssH * 0.75, cssH * 1.1);
        const vx = fromTop ? rand(2.2, 2.8) : rand(-2.8, -2.2);
        const vy = fromTop ? rand(1.3, 1.9) : rand(-1.9, -1.3);
        meteors.push({ x: startX, y: startY, vx, vy, life: 1 });
      }
    }

    // ===== Loop
    let last = performance.now();
    const baseRotX = rand(-0.15, 0.15), baseRotY = rand(-0.15, 0.15);

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, cssW, cssH);

      // Background vignette
      const g = ctx.createRadialGradient(cssW * 0.6, cssH * 0.4, 0, cssW * 0.6, cssH * 0.4, Math.max(cssW, cssH));
      g.addColorStop(0, "rgba(0,0,0,0.00)");
      g.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);

      // Nebula (slowly evolves)
      if (!reduced) nebulaTime += dt * 0.15;
      if (nebulaCtx && !reduced) paintNebula(nebulaCtx, nebulaCanvas.width, nebulaCanvas.height, nebulaTime);
      if (nebulaCanvas) {
        ctx.globalAlpha = 0.28;
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(nebulaCanvas, 0, 0, nebulaCanvas.width, nebulaCanvas.height, 0, 0, cssW, cssH);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      // Stars
      const t = now / 1000;
      if (!reduced) {
        layers.forEach(layer => {
          const sv = speed * layer.depth;
          const dx = (layer.vx + baseRotX * 0.2) * sv;
          const dy = (layer.vy + baseRotY * 0.2) * sv;
          for (const s of layer.stars) {
            const orb = 0.5 + 0.5 * layer.depth;
            const x = s.x + s.ox * Math.sin((t * 0.08 + s.phi) * s.tw * orb);
            const y = s.y + s.oy * Math.cos((t * 0.08 + s.phi) * s.tw * orb);
            s.x += dx * (60 * dt);
            s.y += dy * (60 * dt);
            if (s.x < -4) s.x = cssW + 4;
            if (s.x > cssW + 4) s.x = -4;
            if (s.y < -4) s.y = cssH + 4;
            if (s.y > cssH + 4) s.y = -4;
            const a = Math.max(0, Math.min(1, s.baseA + Math.sin(t * s.tw + s.phi) * 0.25));
            ctx.globalAlpha = a;
            let fill = "#ffffff";
            if (s.tint < 0.15) fill = "rgb(200,220,255)";
            else if (s.tint < 0.30) fill = "rgb(200,245,255)";
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
      } else {
        // draw static stars once (already positioned)
      }

      // Vortex / Black-hole
      if (showVortex) {
        const cx = vortex.x * cssW, cy = vortex.y * cssH;
        const r = Math.max(80, Math.min(vortex.r, Math.min(cssW, cssH) * 0.2));

        // Core: deep radial fade (lens shadow)
        const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
        vg.addColorStop(0, "rgba(0,0,0,0.9)");
        vg.addColorStop(0.6, "rgba(0,0,0,0.65)");
        vg.addColorStop(1, "rgba(0,0,0,0.0)");
        ctx.fillStyle = vg;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Accretion ring (rotates slowly)
        if (!reduced) vortex.angle += dt * 0.06 * speed;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(vortex.angle);
        const ringR = Math.min(vortex.ringR, Math.min(cssW, cssH) * 0.45);
        const ringW = vortex.ringW;
        // glow
        ctx.shadowColor = "rgba(120,220,255,0.35)";
        ctx.shadowBlur = 24;
        ctx.lineWidth = ringW;
        ctx.strokeStyle = "rgba(160,220,255,0.5)";
        ctx.beginPath();
        ctx.ellipse(0, 0, ringR, ringR * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Meteors
      if (!reduced) spawnMeteor();
      ctx.globalAlpha = 0.9;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * (60 * dt);
        m.y += m.vy * (60 * dt);
        m.life -= 0.01 * (60 * dt);

        const trail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 3, m.y - m.vy * 3);
        trail.addColorStop(0, "rgba(255,255,255,0.95)");
        trail.addColorStop(1, "rgba(120,200,255,0.0)");
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6);
        ctx.stroke();

        if (m.life <= 0 || m.x < -80 || m.x > cssW + 80 || m.y < -80 || m.y > cssH + 80) {
          meteors.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(loop);
    }

    // init
    resize();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      media.removeEventListener?.("change", onChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density, speed, meteorRate, showVortex, enableMotion]);

  return (
    <Box position="fixed" inset={0} zIndex={-2} bg="black">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* Extra soft color blotches on a separate layer (CSS, super cheap) */}
      <Box
        position="absolute"
        inset={0}
        zIndex={-1}
        pointerEvents="none"
        style={{ mixBlendMode: "screen" }}
        opacity={0.35}
        bgGradient={`
          radial-gradient(700px 420px at 20% 30%, rgba(59,130,246,0.16), transparent 60%),
          radial-gradient(620px 520px at 80% 70%, rgba(168,85,247,0.14), transparent 60%),
          radial-gradient(520px 360px at 60% 20%, rgba(34,211,238,0.14), transparent 60%)
        `}
      />
    </Box>
  );
}
