/* One Paragon PWA (build 9eac18817866) */
const PAGES = [
  "assets/pages/11.png",
  "assets/pages/12.png",
  "assets/pages/13.png",
  "assets/pages/14.png",
  "assets/pages/15.png",
  "assets/pages/16.png",
  "assets/pages/17.png",
  "assets/pages/18.png",
  "assets/pages/19.png",
  "assets/pages/20.png",
  "assets/pages/21.png",
  "assets/pages/22.png",
  "assets/pages/23.png"
];

const els = {
  img: document.getElementById('pageImg'),
  pageNo: document.getElementById('pageNo'),
  total: document.getElementById('totalPages'),
  slider: document.getElementById('slider'),
  btnPrev: document.getElementById('btnPrev'),
  btnNext: document.getElementById('btnNext'),
  btnFull: document.getElementById('btnFull'),
  btnInstall: document.getElementById('btnInstall'),
  thumbs: document.getElementById('thumbs'),
  status: document.getElementById('status'),
};

let idx = 0;
let deferredPrompt = null;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function setStatus(text) {
  els.status.textContent = text;
  els.status.style.opacity = text ? '1' : '0';
}

function loadPage(i, {scrollThumb=true}={}) {
  idx = clamp(i, 0, PAGES.length - 1);
  const src = PAGES[idx];
  els.img.src = src;
  els.pageNo.textContent = String(idx + 1);
  els.total.textContent = String(PAGES.length);
  els.slider.value = String(idx);

  els.btnPrev.disabled = idx === 0;
  els.btnNext.disabled = idx === PAGES.length - 1;

  [...els.thumbs.children].forEach((t, k) => t.classList.toggle('active', k === idx));
  if (scrollThumb) {
    const active = els.thumbs.children[idx];
    if (active) active.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  }

  history.replaceState(null, '', `#p=${idx+1}`);
}

function parseHash() {
  const m = location.hash.match(/p=(\d+)/);
  if (!m) return 0;
  return clamp(parseInt(m[1],10)-1, 0, PAGES.length-1);
}

function makeThumbs() {
  els.thumbs.innerHTML = '';
  PAGES.forEach((src, i) => {
    const btn = document.createElement('button');
    btn.className = 'thumb';
    btn.type = 'button';
    btn.title = `Page ${i+1}`;
    btn.innerHTML = `<img loading="lazy" src="${src}" alt="Page ${i+1}"><span class="badge">${i+1}</span>`;
    btn.addEventListener('click', () => loadPage(i));
    els.thumbs.appendChild(btn);
  });
}

function go(delta) {
  loadPage(idx + delta);
}

function toggleFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement) {
    root.requestFullscreen?.().catch(()=>{});
  } else {
    document.exitFullscreen?.().catch(()=>{});
  }
}

function bind() {
  els.btnPrev.addEventListener('click', () => go(-1));
  els.btnNext.addEventListener('click', () => go(1));
  els.btnFull.addEventListener('click', toggleFullscreen);
  els.slider.addEventListener('input', (e) => loadPage(parseInt(e.target.value,10), {scrollThumb:false}));

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // swipe
  let startX = null;
  let startY = null;
  const threshold = 45;
  const restraint = 70;

  const onStart = (x, y) => { startX = x; startY = y; };
  const onEnd = (x, y) => {
    if (startX === null || startY === null) return;
    const dx = x - startX;
    const dy = y - startY;
    startX = startY = null;
    if (Math.abs(dx) >= threshold && Math.abs(dy) <= restraint) {
      if (dx < 0) go(1);
      else go(-1);
    }
  };

  const area = document.getElementById('viewer');
  area.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    onStart(t.clientX, t.clientY);
  }, {passive:true});
  area.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    onEnd(t.clientX, t.clientY);
  }, {passive:true});
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./service-worker.js');
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            setStatus('Update available — refresh to load.');
          } else {
            setStatus('Ready for offline use.');
            setTimeout(()=>setStatus(''), 2500);
          }
        }
      });
    });
  } catch (e) {
    // ignore
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  els.btnInstall.hidden = false;
});

els.btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  try {
    await deferredPrompt.userChoice;
  } finally {
    deferredPrompt = null;
    els.btnInstall.hidden = true;
  }
});

window.addEventListener('hashchange', () => loadPage(parseHash(), {scrollThumb:true}));

(function init() {
  els.total.textContent = String(PAGES.length);
  els.slider.max = String(PAGES.length - 1);
  makeThumbs();
  bind();
  loadPage(parseHash(), {scrollThumb:false});
  registerSW();
})();
