import { SCENE } from './config.js';

export async function createRain(canvas, background, notify) {
  let fx;
  try {
    if (!window.RaindropFX) throw new Error('RaindropFX unavailable');
    fx = new window.RaindropFX({
      canvas, background, transparentBackground: true,
      mist: false, backgroundBlurSteps: 1,
      spawnSize: [38, 78], spawnLimit: 500, dropletSize: [5, 14],
      refractBase: 0.25, refractScale: 0.45,
      raindropDiffuseLight: [0.18, 0.21, 0.23],
      raindropSpecularLight: [0, 0, 0],
      raindropShadowOffset: 0.65,
      ...SCENE.rain.medium
    });
    await fx.start();
    fx.stop();
    // Populate the pane before revealing it. Continue with real elapsed time.
    let elapsed = 0;
    for (let i = 0; i < 100; i++) {
      elapsed += 0.05;
      fx.update({ dt: 0.05, total: elapsed });
    }
    let handle, lastTime, contextLost = false;
    function frame(now) {
      const dt = lastTime === undefined ? 0 : Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now; elapsed += dt;
      fx.update({ dt, total: elapsed });
      handle = requestAnimationFrame(frame);
    }
    function resume() {
      cancelAnimationFrame(handle); lastTime = undefined;
      if (!document.hidden && !contextLost) handle = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', resume);
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault(); contextLost = true; cancelAnimationFrame(handle);
      notify('图形加速暂时中断，已切换为轻量雨滴');
      const replacement = canvas.cloneNode();
      canvas.replaceWith(replacement);
      fallback = createFallback(replacement);
      fallback.setLevel(level);
    }, { once: true });
    let fallback = null, level = 'medium';
    canvas.dataset.engine = 'raindrop-fx';
    resume();
    return {
      async setBackground(next) { if (!contextLost) await fx.setBackground(next); },
      setLevel(next) {
        level = next;
        if (fallback) fallback.setLevel(next);
        else Object.assign(fx.options, SCENE.rain[next]);
      }
    };
  } catch (error) {
    fx?.stop();
    console.warn('Rain renderer fallback:', error.message);
    const replacement = canvas.cloneNode();
    canvas.replaceWith(replacement);
    notify('当前浏览器已使用轻量雨滴模式');
    return createFallback(replacement);
  }
}

// Small compatibility fallback only; primary simulation is raindrop-fx.
function createFallback(canvas) {
  canvas.dataset.engine = 'canvas-fallback';
  const ctx = canvas.getContext('2d');
  let level = 'medium', last = 0;
  const drops = Array.from({ length: 110 }, () => ({
    x: Math.random() * SCENE.width, y: Math.random() * SCENE.height,
    r: 1.5 + Math.random() * 3, speed: 20 + Math.random() * 140
  }));
  function frame(time) {
    const dt = Math.min((time - last) / 1000, 0.05); last = time;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = { light: 24, medium: 55, heavy: 110 }[level];
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      d.y += d.speed * dt * ({ light: 0.7, medium: 1, heavy: 1.6 }[level]);
      if (d.y > SCENE.height + 30) { d.y = -30; d.x = Math.random() * SCENE.width; }
      ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(187,210,222,0.11)'; ctx.fill();
      ctx.strokeStyle = 'rgba(210,231,235,0.25)'; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(d.x, d.y - d.r * 2); ctx.lineTo(d.x, d.y - 30);
      ctx.strokeStyle = 'rgba(183,207,220,0.08)'; ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { async setBackground() {}, setLevel(next) { level = next; } };
}
