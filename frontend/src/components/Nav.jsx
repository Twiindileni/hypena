import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';
import logo from '../assets/logo.png';

export default function Nav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          <img src={logo} alt="HypeNa logo" className={styles.brandLogo} />
          <span className={styles.brandName}>Hype <span>NA</span></span>
        </NavLink>
        <div className={styles.tabs}>
          <NavLink to="/"         end className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Home</NavLink>
          <NavLink to="/converter"    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Image Converter</NavLink>
          <NavLink to="/crop"         className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Crop Tool</NavLink>
          <NavLink to="/invoice"      className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>Invoice Generator</NavLink>
        </div>
      </nav>
    </header>
  );
}
