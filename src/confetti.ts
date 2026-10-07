export function triggerConfetti() {
  const existing = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = (canvas.width = window.innerWidth * dpr);
  const height = (canvas.height = window.innerHeight * dpr);

  const colors = [
    '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55',
    '#ffffff', '#64d2ff', '#ffd60a'
  ];

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    decay: number;
    alpha: number;
    shape: 'rect' | 'circle';
  };

  const particles: Particle[] = [];
  const particleCount = 180;

  // 模拟从屏幕上方和两侧同时飘洒爆发的全屏礼炮雨
  for (let i = 0; i < particleCount; i++) {
    // 随机散布在屏幕上方 0% ~ 100% 宽度，向上微喷后悠然飘落，或者从左右下角高角喷向天空
    const isCannon = i < 100;
    let originX: number;
    let originY: number;
    let vx: number;
    let vy: number;

    if (isCannon) {
      const isLeft = i % 2 === 0;
      originX = isLeft ? width * 0.1 : width * 0.9;
      originY = height * 0.9;
      const angle = isLeft
        ? -Math.PI * 0.38 + (Math.random() - 0.5) * 0.45
        : -Math.PI * 0.62 + (Math.random() - 0.5) * 0.45;
      const speed = (Math.random() * 16 + 14) * dpr;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else {
      originX = Math.random() * width;
      originY = -Math.random() * (height * 0.3);
      vx = (Math.random() - 0.5) * 4 * dpr;
      vy = (Math.random() * 3 + 2) * dpr;
    }

    particles.push({
      x: originX,
      y: originY,
      vx,
      vy,
      w: (Math.random() * 7 + 5) * dpr,
      h: (Math.random() * 12 + 6) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      decay: Math.random() * 0.004 + 0.002,
      alpha: 1,
      shape: Math.random() > 0.25 ? 'rect' : 'circle'
    });
  }

  const gravity = 0.28 * dpr;
  const drag = 0.988;

  function render() {
    ctx!.clearRect(0, 0, width, height);
    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0.01) continue;
      activeCount++;

      p.vx *= drag;
      p.vy *= drag;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      ctx!.save();
      ctx!.globalAlpha = Math.max(0, p.alpha);
      ctx!.fillStyle = p.color;
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);

      if (p.shape === 'rect') {
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    if (activeCount > 0) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(render);
}
