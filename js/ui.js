import { SCENE, SCENES } from './config.js';
import { state, update, subscribe } from './state.js';

export function createNotifier() {
  let timer;
  const el = document.querySelector('#status');
  return text => {
    clearTimeout(timer); el.textContent = text; el.classList.add('visible');
    timer = setTimeout(() => el.classList.remove('visible'), 2400);
  };
}

export function bindUI({ fog, rain, audio, changeScene, notify }) {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  $('.sound-sliders').innerHTML = Object.entries({ rain: '雨声', city: '城市环境', wind: '风声' })
    .map(([key, label]) => `<label class="range-label" for="sound-${key}">${label}<output data-sound-value="${key}"></output></label><input id="sound-${key}" type="range" data-sound="${key}" min="0" max="100" value="${state.sound[key]}">`).join('');

  // One active popover, anchored above the original V1 floating control bar.
  let openName = null;
  function closePopover(restoreFocus = false) {
    const previous = openName;
    $$('.popover').forEach(el => { el.hidden = true; });
    $$('[data-popover]').forEach(el => el.setAttribute('aria-expanded', 'false'));
    openName = null;
    if (restoreFocus && previous) $(`[data-popover="${previous}"]`).focus({ preventScroll: true });
  }
  $$('[data-popover]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.popover;
    if (openName === name) { closePopover(); return; }
    closePopover();
    openName = name;
    const panel = $(`#${name}-popover`);
    panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    panel.querySelector('button,input')?.focus({ preventScroll: true });
    $('#hint').classList.add('dismissed');
  }));
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('.controls')) closePopover();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openName) { e.preventDefault(); closePopover(true); }
  });

  // V1.1 operations below retain their existing state and controller APIs.
  $$('[data-scene]').forEach(el => el.addEventListener('click', () => {
    void changeScene(el.dataset.scene); closePopover(true);
  }));
  $('#upload').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      notify('请选择 JPG、PNG 或 WebP 图片'); e.target.value = ''; return;
    }
    const url = URL.createObjectURL(file);
    try {
      await changeScene('custom', { image: url, label: '自定义风景', caption: '04 / YOUR WINDOW', cropY: .5 });
      closePopover(true);
    } finally { URL.revokeObjectURL(url); e.target.value = ''; }
  });
  $('#brush').addEventListener('input', e => {
    update({ brush: Number(e.target.value) }); fog.setBrush(state.brush);
  });
  $('#pause-fog').addEventListener('click', () => {
    update({ paused: !state.paused }); fog.setPaused(state.paused);
    notify(state.paused ? '雾气恢复已暂停 · 仍可擦拭' : '雾气恢复已继续');
  });
  $('#reset').addEventListener('click', () => { fog.reset(); notify('雾气已重置'); });
  $$('[data-rain]').forEach(el => el.addEventListener('click', () => {
    update({ rain: el.dataset.rain }); rain.setLevel(state.rain);
    closePopover(true); notify(`已切换为${SCENE.rain[state.rain].label}`);
  }));
  $$('[data-sound]').forEach(el => el.addEventListener('input', () => audio.setTrack(el.dataset.sound, el.value)));
  $('#sound-play').addEventListener('click', () => void audio.toggle());
  $('#master').addEventListener('input', e => audio.setMaster(e.target.value));

  const fullscreen = $('#fullscreen');
  const active = () => document.fullscreenElement || document.webkitFullscreenElement;
  function syncFullscreen() {
    const label = active() ? '退出全屏' : '进入全屏';
    fullscreen.title = label; fullscreen.setAttribute('aria-label', label);
    fullscreen.setAttribute('aria-pressed', String(!!active()));
  }
  fullscreen.addEventListener('click', async () => {
    closePopover();
    try {
      if (active()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        await exit.call(document);
      } else {
        const request = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
        if (!request) throw Error();
        await request.call(document.documentElement);
      }
      syncFullscreen();
    } catch { notify('当前容器不支持全屏，请在独立浏览器中打开'); }
  });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(type => document.addEventListener(type, syncFullscreen));

  subscribe(s => {
    $$('[data-scene]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.scene === s.scene)));
    $('#current-scene').textContent = SCENES[s.scene]?.label || '自定义风景';
    $('#brush').value = s.brush; $('#brush-value').textContent = `${s.brush} px`;
    $('#pause-fog').textContent = s.paused ? '继续恢复' : '暂停恢复';
    $('#pause-fog').setAttribute('aria-pressed', String(s.paused));
    $$('[data-rain]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.rain === s.rain)));
    $('#rain-toggle').title = `雨量：${SCENE.rain[s.rain].label}`;
    $('#rain-toggle').setAttribute('aria-label', $('#rain-toggle').title);
    $$('[data-sound]').forEach(el => { el.value = s.sound[el.dataset.sound]; });
    $$('[data-sound-value]').forEach(el => { el.textContent = `${s.sound[el.dataset.soundValue]}%`; });
    $('#sound-play').textContent = s.playing ? '静音' : '开启声音';
    $('#sound-play').setAttribute('aria-pressed', String(s.playing));
    $('#sound-toggle').classList.toggle('sound-playing', s.playing);
    $('#master').value = s.master; $('#master-value').textContent = `${s.master}%`;
  });
}
