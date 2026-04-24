import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';
import logo from '../assets/logo.png';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 800) setIsOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.topRow}>
          <NavLink to="/" className={styles.brand} onClick={closeMenu}>
            <img src={logo} alt="HypeNa logo" className={styles.brandLogo} />
            <span className={styles.brandName}>Hype <span>NA</span></span>
          </NavLink>

          <button
            type="button"
            className={`${styles.burger} ${isOpen ? styles.burgerOpen : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`${styles.tabs} ${isOpen ? styles.tabsOpen : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/converter" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Image Converter</NavLink>
          <NavLink to="/crop" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Crop Tool</NavLink>
          <NavLink to="/invoice" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`} onClick={closeMenu}>Invoice Generator</NavLink>
        </div>
      </nav>
    </header>
  );
}
