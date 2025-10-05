import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

/**
 * Parallax starfield with slow orbital drift, twinkle, and rare shooting stars.
 * - Motion respects prefers-reduced-motion, but can be forced via `enableMotion`.
 * - Frame-rate independent (uses dt).
 */
export default function Starfield({
  // stars per pixel (CSS px). ~0.00035 is subtle; increase for denser sky.
  density = 0.00045,
  // base speed multiplier; 1 = cinematic slow, 0.5 = ultra slow, 2 = faster
  speed = 1,
  // force motion regardless of user setting
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

    // 3 parallax layers
    const layers = [
      { stars: [], depth: 0.33, vx: 0.006, vy: 0.004 }, // far
      { stars: [], depth: 0.66, vx: 0.012, vy: 0.008 }, // mid
      { stars: [], depth: 1.00, vx: 0.020, vy: 0.014 }, // near
    ];

    const rand = (a, b) => a + Math.random() * (b - a);

    function makeStars() {
      layers.forEach(l => (l.stars = []));
      const total = Math.max(120, Math.floor(cssW * cssH * density));
      // distribute across layers (more on far and mid)
      const weights = [0.4, 0.4, 0.2];
      layers.forEach((layer, i) => {
        const count = Math.floor(total * weights[i]);
        for (let k = 0; k < count; k++) {
          layer.stars.push({
            x: Math.random() * cssW,
            y: Math.random() * cssH,
            r: rand(0.6, 1.6) * layer.depth,    // radius by depth
            baseA: rand(0.25, 0.75),            // base alpha
            tw: rand(0.8, 1.6),                 // twinkle speed factor
            phi: rand(0, Math.PI * 2),          // phase
            // small radial orbit around a local center to avoid linear feel
            ox: rand(-12, 12) * (2 - layer.depth),
            oy: rand(-12, 12) * (2 - layer.depth),
            // slight hue tint for variety (blue/cyan/white)
            tint: Math.random(),
          });
        }
      });
    }

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      // set CSS size from the element box
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      // set drawing buffer size
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      makeStars();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // shooting star state
    const meteors = [];
    function maybeSpawnMeteor() {
      // ~once every 8–20 seconds
      if (Math.random() < 0.002) {
        const fromTop = Math.random() < 0.5;
        const startX = fromTop ? rand(-cssW * 0.1, cssW * 0.3) : rand(cssW * 0.7, cssW * 1.1);
        const startY = fromTop ? rand(-cssH * 0.1, cssH * 0.2) : rand(cssH * 0.7, cssH * 1.1);
        const vx = fromTop ? rand(2.2, 2.8) : rand(-2.8, -2.2);
        const vy = fromTop ? rand(1.4, 2.0) : rand(-2.0, -1.4);
        meteors.push({ x: startX, y: startY, vx, vy, life: 1 });
      }
    }

    let last = performance.now();
    const baseRotX = rand(-0.15, 0.15); // tiny orbital bias
    const baseRotY = rand(-0.15, 0.15);

    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); // seconds; clamp spikes
      last = now;

      // clear with gentle vignetting
      ctx.clearRect(0, 0, cssW, cssH);
      const g = ctx.createRadialGradient(cssW * 0.6, cssH * 0.4, 0, cssW * 0.6, cssH * 0.4, Math.max(cssW, cssH));
      g.addColorStop(0, "rgba(0,0,0,0.0)");
      g.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cssW, cssH);

      const t = now / 1000;
      if (!reduced) {
        // draw stars with parallax drift and local orbit
        layers.forEach(layer => {
          const sv = speed * layer.depth; // parallax speed
          const dx = (layer.vx + baseRotX * 0.2) * sv;
          const dy = (layer.vy + baseRotY * 0.2) * sv;

          for (const s of layer.stars) {
            // orbital wobble
            const orb = 0.5 + 0.5 * layer.depth;
            const x = s.x + s.ox * Math.sin((t * 0.08 + s.phi) * s.tw * orb);
            const y = s.y + s.oy * Math.cos((t * 0.08 + s.phi) * s.tw * orb);

            // drift
            s.x += dx * (60 * dt); // frame-rate independence
            s.y += dy * (60 * dt);

            // wrap
            if (s.x < -4) s.x = cssW + 4;
            if (s.x > cssW + 4) s.x = -4;
            if (s.y < -4) s.y = cssH + 4;
            if (s.y > cssH + 4) s.y = -4;

            // twinkle
            const a = Math.max(0, Math.min(1, s.baseA + Math.sin(t * s.tw + s.phi) * 0.25));
            ctx.globalAlpha = a;

            // subtle tinting
            let fill = "#ffffff";
            if (s.tint < 0.15) fill = "rgb(200,220,255)"; // cool blue
            else if (s.tint < 0.30) fill = "rgb(200,245,255)"; // cyan
            ctx.fillStyle = fill;

            ctx.beginPath();
            ctx.arc(x, y, s.r, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // meteors
        maybeSpawnMeteor();
        ctx.globalAlpha = 0.9;
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx * (60 * dt);
          m.y += m.vy * (60 * dt);
          m.life -= 0.01 * (60 * dt);

          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 2, m.y - m.vy * 2);
          ctx.stroke();

          if (m.life <= 0 || m.x < -50 || m.x > cssW + 50 || m.y < -50 || m.y > cssH + 50) {
            meteors.splice(i, 1);
          }
        }
        ctx.globalAlpha = 1;
      } else {
        // reduced motion: static stars, gentle fade already rendered
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    // start
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      media.removeEventListener?.("change", onChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density, speed, enableMotion]);

  return (
    <Box position="fixed" inset={0} zIndex={-2} bg="black">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </Box>
  );
}
