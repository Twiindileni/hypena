import { useState, useRef, useMemo, useEffect } from 'react';
import { PRESET_GROUPS } from '../constants/presets';
import styles from './Converter.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Converter() {
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState({});  // presetKey -> bool
  const [done, setDone]           = useState({});   // presetKey -> bool
  const inputRef                  = useRef(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) { setFile(f); setDone({}); }
  }

  async function downloadPreset(preset) {
    if (!file) return;
    const key = `${preset.category}-${preset.name}`;
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const blob = await convertWithFallback(file, preset.w, preset.h);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${preset.name.replace(/\s+/g, '-').toLowerCase()}-${preset.w}x${preset.h}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDone(prev => ({ ...prev, [key]: true }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }

  async function convertWithFallback(sourceFile, w, h) {
    try {
      const form = new FormData();
      form.append('file', sourceFile);
      form.append('w', w);
      form.append('h', h);

      const res = await fetch(`${API_URL}/api/convert`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Backend conversion failed');
      return await res.blob();
    } catch {
      return await convertInBrowser(sourceFile, w, h);
    }
  }

  function convertInBrowser(sourceFile, w, h) {
    return new Promise((resolve, reject) => {
      const srcUrl = URL.createObjectURL(sourceFile);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not supported');

          // Match backend "contain" behavior with white letterboxing.
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);

          const scale = Math.min(w / img.width, h / img.height);
          const drawW = Math.round(img.width * scale);
          const drawH = Math.round(img.height * scale);
          const dx = Math.round((w - drawW) / 2);
          const dy = Math.round((h - drawH) / 2);

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, dx, dy, drawW, drawH);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(srcUrl);
              if (!blob) return reject(new Error('Failed to generate image'));
              resolve(blob);
            },
            'image/jpeg',
            0.92
          );
        } catch (err) {
          URL.revokeObjectURL(srcUrl);
          reject(err instanceof Error ? err : new Error('Client conversion failed'));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(srcUrl);
        reject(new Error('Could not load selected image'));
      };

      img.src = srcUrl;
    });
  }

  return (
    <main className={`${styles.main} page-enter`}>
      <div className={styles.header}>
        <h2>Image Converter</h2>
        <p>Upload an image and download it resized to any preset — server-side Lanczos resampling for maximum quality.</p>
      </div>

      {!file ? (
        <div className={styles.uploadArea} onClick={() => inputRef.current.click()}>
          <div className={styles.uploadIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className={styles.uploadLabel}>Click to choose an image</p>
          <p className={styles.uploadHint}>PNG · JPG · WEBP supported</p>
        </div>
      ) : (
        <>
          <div className={styles.fileBar}>
            <span className={styles.fileName}>📎 {file.name}</span>
            <button className={styles.changeBtn} onClick={() => { setFile(null); setDone({}); }}>
              Change Image
            </button>
          </div>

          {Object.entries(PRESET_GROUPS).map(([category, presets]) => (
            <section key={category} className={styles.section}>
              <div className={styles.sectionTitle}>
                <h3>{category}</h3>
                <span className={`${styles.badge} ${styles[`badge${category.replace(/\s/g,'')}`]}`}>
                  {presets.length} preset{presets.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className={styles.grid}>
                {presets.map(preset => {
                  const key     = `${preset.category}-${preset.name}`;
                  const isLoading = loading[key];
                  const isDone    = done[key];
                  return (
                    <div key={key} className={styles.card}>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardName}>{preset.name}</span>
                        <span className={styles.cardDims}>{preset.w} × {preset.h} px</span>
                      </div>
                      <div className={styles.aspectPreview} style={{ aspectRatio: `${preset.w}/${preset.h}` }}>
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={`${preset.name} preview`}
                            className={styles.previewImg}
                          />
                        ) : (
                          <span>{preset.w}×{preset.h}</span>
                        )}
                      </div>
                      <button
                        className={`${styles.dlBtn} ${isDone ? styles.dlDone : ''}`}
                        onClick={() => downloadPreset(preset)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className={styles.spinner} />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5m0 0l-4.5-4.5M12 16.5l4.5-4.5" />
                          </svg>
                        )}
                        {isLoading ? 'Processing…' : isDone ? 'Downloaded ✓' : 'Download'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className={styles.divider} />
            </section>
          ))}
        </>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    </main>
  );
}
