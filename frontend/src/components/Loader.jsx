import { useEffect, useState } from 'react';
import styles from './Loader.module.css';
import logo from '../assets/logo.png';

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Show loader for 2.5 seconds then fade out
    const fadeTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    // Completely remove from DOM after fade animation (0.8s)
    const removeTimeout = setTimeout(() => {
      setShouldRender(false);
    }, 3300);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.overlay} ${!isVisible ? styles.fadeOut : ''}`}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="HypeNa Logo" className={styles.logo} />
          <div className={styles.glow} />
        </div>
        <div className={styles.text}>
          Hype <span>NA</span>
        </div>
        <div className={styles.loadingBar}>
          <div className={styles.progress} />
        </div>
      </div>
    </div>
  );
}
