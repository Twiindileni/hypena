import { useState, useRef, useEffect, useCallback } from 'react';
import { PRESETS, PRESET_GROUPS } from '../constants/presets';
import styles from './CropTool.module.css';

const API_URL    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CANVAS_MAX_W  = 820;
const CANVAS_MAX_H  = 500;
const HANDLE_RADIUS = 8;
const MIN_CROP_PX   = 40;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function CropTool() {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [file, setFile]                 = useState(null);       // original File
  const [imgEl, setImgEl]               = useState(null);       // HTMLImageElement
  const [downloading, setDownloading]   = useState(false);

  const canvasRef      = useRef(null);
  const previewRef     = useRef(null);
  const fileInputRef   = useRef(null);
  const wrapRef        = useRef(null);

  // crop in image pixels, displayScale, interaction stored in refs (no re-render needed)
  const cropRef        = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const scaleRef       = useRef(1);
  const interactionRef = useRef(null);
  const infoRef        = useRef({ preset: '', size: '', region: '' });

  // ── helpers ──────────────────────────────────────────────────────────────
  const toCvs = (c, scale) => ({
    x: c.x * scale, y: c.y * scale, w: c.w * scale, h: c.h * scale,
  });

  function getHandles(x, y, w, h) {
    return [
      { id: 'nw', cx: x,     cy: y     },
      { id: 'n',  cx: x+w/2, cy: y     },
      { id: 'ne', cx: x+w,   cy: y     },
      { id: 'e',  cx: x+w,   cy: y+h/2 },
      { id: 'se', cx: x+w,   cy: y+h   },
      { id: 's',  cx: x+w/2, cy: y+h   },
      { id: 'sw', cx: x,     cy: y+h   },
      { id: 'w',  cx: x,     cy: y+h/2 },
    ];
  }

  // ── draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback((img, crop, scale) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const { x, y, w, h } = toCvs(crop, scale);
    const iW = canvas.width, iH = canvas.height;

    ctx.clearRect(0, 0, iW, iH);
    ctx.drawImage(img, 0, 0, iW, iH);

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0,   0,    iW,     y        );
    ctx.fillRect(0,   y+h,  iW,     iH-y-h   );
    ctx.fillRect(0,   y,    x,      h        );
    ctx.fillRect(x+w, y,    iW-x-w, h        );

    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(x+w*i/3, y); ctx.lineTo(x+w*i/3, y+h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y+h*i/3); ctx.lineTo(x+w, y+h*i/3); ctx.stroke();
    }

    getHandles(x, y, w, h).forEach(hp => {
      ctx.beginPath(); ctx.arc(hp.cx, hp.cy, HANDLE_RADIUS, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    });
  }, []);

  const updatePreview = useCallback((img, crop) => {
    const pCvs = previewRef.current;
    if (!pCvs || !img) return;
    const PREV_W = 230;
    const PREV_H = Math.round(PREV_W * (activePreset.h / activePreset.w));
    pCvs.width = PREV_W; pCvs.height = PREV_H;
    pCvs.getContext('2d').drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, PREV_W, PREV_H);
  }, [activePreset]);

  // ── fit canvas + init crop ────────────────────────────────────────────────
  const initCanvas = useCallback((img, preset) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ar = img.naturalWidth / img.naturalHeight;
    const wrapW = wrapRef.current?.clientWidth - 32 || CANVAS_MAX_W;
    let w = Math.min(CANVAS_MAX_W, wrapW);
    let h = w / ar;
    if (h > CANVAS_MAX_H) { h = CANVAS_MAX_H; w = h * ar; }
    canvas.width  = Math.round(w);
    canvas.height = Math.round(h);
    const scale = canvas.width / img.naturalWidth;
    scaleRef.current = scale;

    const pAr  = preset.w / preset.h;
    const imgAr = img.naturalWidth / img.naturalHeight;
    let crop;
    if (imgAr > pAr) {
      const ch = img.naturalHeight, cw = ch * pAr;
      crop = { x: (img.naturalWidth - cw) / 2, y: 0, w: cw, h: ch };
    } else {
      const cw = img.naturalWidth, ch = cw / pAr;
      crop = { x: 0, y: (img.naturalHeight - ch) / 2, w: cw, h: ch };
    }
    cropRef.current = crop;
    return { scale, crop };
  }, []);

  // ── load image ───────────────────────────────────────────────────────────
  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      setImgEl(img);
    };
    img.src = url;
    e.target.value = '';
  }

  // ── (re)draw when image or preset changes ─────────────────────────────────
  useEffect(() => {
    if (!imgEl) return;
    const res = initCanvas(imgEl, activePreset);
    if (!res) return;
    draw(imgEl, res.crop, res.scale);
    updatePreview(imgEl, res.crop);
  }, [imgEl, activePreset, initCanvas, draw, updatePreview]);

  // ── mouse / touch events ─────────────────────────────────────────────────
  function getPos(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  function onDown(e) {
    if (!imgEl) return;
    if (e.cancelable) e.preventDefault();
    const pos    = getPos(e);
    const scale  = scaleRef.current;
    const crop   = cropRef.current;
    const { x, y, w, h } = toCvs(crop, scale);
    const handles = getHandles(x, y, w, h);

    for (const hp of handles) {
      if (Math.hypot(pos.x - hp.cx, pos.y - hp.cy) <= HANDLE_RADIUS + 5) {
        interactionRef.current = { type: hp.id, startMX: pos.x, startMY: pos.y, startCrop: { ...crop } };
        return;
      }
    }
    if (pos.x >= x && pos.x <= x+w && pos.y >= y && pos.y <= y+h) {
      interactionRef.current = { type: 'move', startMX: pos.x, startMY: pos.y, startCrop: { ...crop } };
    }
  }

  function onMove(e) {
    if (!imgEl) return;
    if (e.cancelable) e.preventDefault();
    const pos   = getPos(e);
    const scale = scaleRef.current;
    const ia    = interactionRef.current;

    if (!ia) {
      // cursor update
      const crop    = cropRef.current;
      const { x, y, w, h } = toCvs(crop, scale);
      const handles = getHandles(x, y, w, h);
      const CURSORS = { nw:'nw-resize',n:'n-resize',ne:'ne-resize',e:'e-resize',se:'se-resize',s:'s-resize',sw:'sw-resize',w:'w-resize' };
      const canvas  = canvasRef.current;
      for (const hp of handles) {
        if (Math.hypot(pos.x - hp.cx, pos.y - hp.cy) <= HANDLE_RADIUS + 5) {
          canvas.style.cursor = CURSORS[hp.id]; return;
        }
      }
      canvas.style.cursor = (pos.x>=x&&pos.x<=x+w&&pos.y>=y&&pos.y<=y+h) ? 'move' : 'default';
      return;
    }

    const dx = (pos.x - ia.startMX) / scale;
    const dy = (pos.y - ia.startMY) / scale;
    const sc = ia.startCrop;
    const ar = activePreset.w / activePreset.h;
    const img = imgEl;

    if (ia.type === 'move') {
      cropRef.current.x = clamp(sc.x + dx, 0, img.naturalWidth  - cropRef.current.w);
      cropRef.current.y = clamp(sc.y + dy, 0, img.naturalHeight - cropRef.current.h);
    } else {
      applyResize(ia.type, dx, dy, sc, ar, img);
    }

    draw(imgEl, cropRef.current, scale);
    updatePreview(imgEl, cropRef.current);
  }

  function onUp() { interactionRef.current = null; }

  function applyResize(handle, dx, dy, sc, ar, img) {
    let { x, y, w, h } = sc;
    const MIN = MIN_CROP_PX;
    switch (handle) {
      case 'se': w=Math.max(MIN,sc.w+dx); h=w/ar; break;
      case 'sw': w=Math.max(MIN,sc.w-dx); h=w/ar; x=sc.x+sc.w-w; break;
      case 'ne': w=Math.max(MIN,sc.w+dx); h=w/ar; y=sc.y+sc.h-h; break;
      case 'nw': w=Math.max(MIN,sc.w-dx); h=w/ar; x=sc.x+sc.w-w; y=sc.y+sc.h-h; break;
      case 'e':  w=Math.max(MIN,sc.w+dx); h=w/ar; y=sc.y+(sc.h-h)/2; break;
      case 'w':  w=Math.max(MIN,sc.w-dx); h=w/ar; x=sc.x+sc.w-w; y=sc.y+(sc.h-h)/2; break;
      case 's':  h=Math.max(MIN/ar,sc.h+dy); w=h*ar; x=sc.x+(sc.w-w)/2; break;
      case 'n':  h=Math.max(MIN/ar,sc.h-dy); w=h*ar; y=sc.y+sc.h-h; x=sc.x+(sc.w-w)/2; break;
    }
    x = clamp(x, 0, img.naturalWidth  - w);
    y = clamp(y, 0, img.naturalHeight - h);
    if (x+w > img.naturalWidth)  w = img.naturalWidth  - x;
    if (y+h > img.naturalHeight) h = img.naturalHeight - y;
    cropRef.current = { x, y, w, h };
  }

  // ── download via API ──────────────────────────────────────────────────────
  async function downloadCrop() {
    if (!file || !imgEl) return;
    setDownloading(true);
    try {
      const crop = cropRef.current;
      const form = new FormData();
      form.append('file', file);
      form.append('x',  Math.round(crop.x));
      form.append('y',  Math.round(crop.y));
      form.append('cw', Math.round(crop.w));
      form.append('ch', Math.round(crop.h));
      form.append('w',  activePreset.w);
      form.append('h',  activePreset.h);

      const res  = await fetch(`${API_URL}/api/crop`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${activePreset.category}-${activePreset.name}-${activePreset.w}x${activePreset.h}.jpg`
                     .replace(/\s+/g, '-').toLowerCase();
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  }

  // ── resize canvas on window resize ──────────────────────────────────────
  useEffect(() => {
    function onResize() {
      if (!imgEl) return;
      const res = initCanvas(imgEl, activePreset);
      if (res) { draw(imgEl, res.crop, res.scale); updatePreview(imgEl, res.crop); }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [imgEl, activePreset, initCanvas, draw, updatePreview]);

  // ── render ───────────────────────────────────────────────────────────────
  const crop = cropRef.current;

  return (
    <main className={`${styles.main} page-enter`}>
      <div className={styles.pageHeader}>
        <h2>Crop Tool</h2>
        <p>Drag the crop box to frame exactly what you want, then download at full preset resolution.</p>
      </div>

      {!imgEl ? (
        <div className={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
          <div className={styles.uploadIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className={styles.uploadLabel}>Drop an image here, or click to browse</p>
          <p className={styles.uploadHint}>PNG · JPG · WEBP supported</p>
        </div>
      ) : (
        <>
          {/* Preset bar */}
          <div className={styles.presetBar}>
            <span className={styles.presetBarLabel}>Preset:</span>
            <div className={styles.presetPills}>
              {Object.entries(PRESET_GROUPS).map(([cat, presets]) => (
                <div key={cat} className={styles.presetGroup}>
                  <span className={styles.presetGroupLabel}>{cat}</span>
                  {presets.map(p => (
                    <button
                      key={`${p.category}-${p.name}`}
                      className={`${styles.pill} ${p === activePreset ? styles.pillActive : ''}`}
                      onClick={() => setActivePreset(p)}
                    >
                      {p.name} ({p.w}×{p.h})
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <button className={styles.changeBtn} onClick={() => { setFile(null); setImgEl(null); }}>
              Change Image
            </button>
          </div>

          {/* Workspace */}
          <div className={styles.workspace}>
            <div className={styles.canvasCol}>
              <div className={styles.canvasWrap} ref={wrapRef}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={onDown}
                  onMouseMove={onMove}
                  onMouseUp={onUp}
                  onTouchStart={onDown}
                  onTouchMove={onMove}
                  onTouchEnd={onUp}
                />
              </div>
              <p className={styles.hint}>Drag inside to move · Drag handles to resize · Aspect ratio locked to preset</p>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>Preview</h3>
                <div className={styles.previewWrap}>
                  <canvas ref={previewRef} className={styles.previewCanvas} />
                </div>
                <div className={styles.infoTable}>
                  <div className={styles.infoRow}>
                    <span>Preset</span>
                    <span>{activePreset.category} — {activePreset.name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Output</span>
                    <span>{activePreset.w} × {activePreset.h} px</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Selection</span>
                    <span>{Math.round(crop.w)} × {Math.round(crop.h)} px</span>
                  </div>
                </div>
                <button className={styles.dlBtn} onClick={downloadCrop} disabled={downloading}>
                  {downloading ? (
                    <span className={styles.spinner} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
                    </svg>
                  )}
                  {downloading ? 'Processing…' : 'Download Cropped'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </main>
  );
}
