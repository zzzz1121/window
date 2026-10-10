// All visual layers share a fixed 16:9 coordinate system; CSS scales them together.
export const SCENE = Object.freeze({
  width: 1920, height: 1080,
  image: 'assets/rainy-night.jpg',
  cropY: 0.57, // Retain the person, headlights and wet-road reflections.
  grade: 'saturate(0.66) brightness(0.88)',
  brushRadius: 75,
  audioVolume: 0.38,
  rain: {
    light: { label: '小雨', spawnInterval: [0.3, 0.55], dropletsPerSeconds: 8, gravity: 1300, slipRate: 0.35 },
    medium: { label: '中雨', spawnInterval: [0.09, 0.18], dropletsPerSeconds: 24, gravity: 1700, slipRate: 0.5 },
    heavy: { label: '大雨', spawnInterval: [0.025, 0.06], dropletsPerSeconds: 70, gravity: 2200, slipRate: 0.65 }
  }
});

export const SCENES = {
  city: { label: '城市雨夜', caption: '01 / RAINY NIGHT', image: 'assets/rainy-night.jpg', cropY: 0.57, grade: SCENE.grade },
  forest: { label: '森林雨窗', caption: '02 / FOREST RAIN', image: 'assets/forest.jpg', cropY: 0.45, grade: 'saturate(0.65) brightness(0.82)' },
  seaside: { label: '海边雨窗', caption: '03 / SEASIDE RAIN', image: 'assets/seaside.jpg', cropY: 0.5, grade: 'saturate(0.55) brightness(0.8)' }
};

export async function paintScene(canvas, scene = SCENES.city) {
  const image = new Image();
  image.src = scene.image;
  await image.decode();
  const ctx = canvas.getContext('2d');
  const scale = Math.max(SCENE.width / image.width, SCENE.height / image.height);
  const w = image.width * scale, h = image.height * scale;
  ctx.filter = scene.grade || 'none';
  ctx.drawImage(image, (SCENE.width - w) / 2, (SCENE.height - h) * (scene.cropY ?? 0.5), w, h);
  ctx.filter = 'none';
  // Very subtle cool cast; the photographic warm lights remain intact.
  ctx.fillStyle = 'rgba(32, 57, 75, 0.075)';
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);
  return canvas;
}
