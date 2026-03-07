"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "../ui/components/buttons/ActionButton";
import styles from "../styles/not-found.module.css";

type Asteroid = {
  x: number;
  y: number;
  r: number;
  speed: number;
};

type StarDot = {
  x: number;
  y: number;
  size: number;
  drift: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [runId, setRunId] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const bestText = useMemo(() => bestScore.toFixed(1), [bestScore]);
  const scoreText = useMemo(() => score.toFixed(1), [score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let animationId = 0;
    let last = performance.now();
    let spawnTimer = 0;
    let scoreTimer = 0;
    let elapsed = 0;
    let ended = false;

    const ship = { x: 72, y: height / 2, r: 13 };
    let pointerY = ship.y;

    const stars: StarDot[] = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.4,
      drift: Math.random() * 0.8 + 0.2,
    }));

    const asteroids: Asteroid[] = [];

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerY = clamp(event.clientY - rect.top, 16, height - 16);
    };

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      pointerY = clamp(touch.clientY - rect.top, 16, height - 16);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") pointerY -= 30;
      if (event.key === "ArrowDown") pointerY += 30;
      pointerY = clamp(pointerY, 16, height - 16);
    };

    const collide = (a: Asteroid) => {
      const dx = a.x - ship.x;
      const dy = a.y - ship.y;
      return Math.hypot(dx, dy) < a.r + ship.r;
    };

    const drawShip = () => {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.fillStyle = "#11c9ee";
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-11, -8);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-11, 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#f8ffe5";
      ctx.beginPath();
      ctx.arc(-2, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;

      const t = dt / 16.666;
      elapsed += dt / 1000;
      scoreTimer += dt;

      const gradient = ctx.createRadialGradient(width * 0.35, height * 0.2, 10, width * 0.5, height * 0.5, width);
      gradient.addColorStop(0, "#15212d");
      gradient.addColorStop(1, "#070b11");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.x -= star.drift * t;
        if (star.x < -3) {
          star.x = width + Math.random() * 20;
          star.y = Math.random() * height;
        }
        ctx.fillStyle = "rgba(232,248,255,0.75)";
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      if (!ended) {
        ship.y += (pointerY - ship.y) * 0.18 * t;

        spawnTimer += dt;
        const cadence = Math.max(380, 760 - elapsed * 12);
        if (spawnTimer >= cadence) {
          spawnTimer = 0;
          asteroids.push({
            x: width + 24,
            y: Math.random() * (height - 40) + 20,
            r: Math.random() * 14 + 10,
            speed: Math.random() * 2.6 + 2.2 + elapsed * 0.08,
          });
        }

        for (let i = asteroids.length - 1; i >= 0; i -= 1) {
          const rock = asteroids[i];
          rock.x -= rock.speed * t;
          if (collide(rock)) {
            ended = true;
            setGameOver(true);
            setBestScore((prev) => Math.max(prev, elapsed));
          }
          if (rock.x < -40) asteroids.splice(i, 1);
        }

        if (scoreTimer >= 120) {
          scoreTimer = 0;
          setScore(elapsed);
        }
      }

      for (const rock of asteroids) {
        ctx.fillStyle = "#8ea2b8";
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#5e7084";
        ctx.beginPath();
        ctx.arc(rock.x - rock.r * 0.25, rock.y - rock.r * 0.2, rock.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      drawShip();

      if (ended) {
        ctx.fillStyle = "rgba(4, 8, 14, 0.72)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ff7f7f";
        ctx.font = "700 24px var(--font-heading), Montserrat, sans-serif";
        ctx.fillText("Ship destroyed", width / 2 - 76, height / 2 - 6);
        ctx.fillStyle = "#d5dbe7";
        ctx.font = "500 14px var(--font-body), Roboto Condensed, sans-serif";
        ctx.fillText("Press Retry Minigame to fly again", width / 2 - 104, height / 2 + 20);
      }

      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);

    setGameOver(false);
    setScore(0);
    animationId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, [runId]);

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Oops... that page does not exist</h1>
      <p className={styles.subtitle}>Pilot your ship, dodge asteroids, and try to beat your best run.</p>

      <article className={styles.gameCard}>
        <div className={styles.hudRow}>
          <p>Survival: {scoreText}s</p>
          <p>Best: {bestText}s</p>
          <p>{gameOver ? "Status: Crashed" : "Status: Flying"}</p>
        </div>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.actions}>
          <ActionButton variant="secondary" onClick={() => setRunId((prev) => prev + 1)}>
            Retry Minigame
          </ActionButton>
          <ActionButton onClick={() => window.location.assign("/")}>Go Home</ActionButton>
        </div>
      </article>
    </section>
  );
}
