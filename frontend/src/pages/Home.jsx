import PhoneMockup from '../components/PhoneMockup';
import styles from './Home.module.css';
import logo from '../assets/logo.png';

export default function Home() {
  return (
    <main className={`${styles.main} page-enter`}>
      <div className={styles.hero}>

        {/* Left */}
        <div className={styles.left}>
          <img src={logo} alt="HypeNa logo" className={styles.logo} />
          <h1 className={styles.headline}>
            Namibian<br />Businesses!
          </h1>
          <p className={styles.sub}>It's your time to shine!</p>
          <p className={styles.desc}>
            List your services on HypeNa and reach thousands of customers across the country.
            From events to lifestyle services, HypeNa is your platform to grow your brand and
            connect with the right audience.
          </p>
          <p className={styles.cta}>Sign up today and get your business noticed!</p>

          <div className={styles.storeBtns}>
            <a className={styles.storeBtn} href="#" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 384 512" fill="currentColor" aria-label="Apple logo">
                <path d="M318.7 268.7c-.2-36.7 29.8-54.4 31.2-55.2-17.1-25-43.7-28.5-53.1-28.9-22.4-2.3-43.8 13.1-55.2 13.1-11.4 0-28.9-12.8-47.5-12.5-24.5.4-47 14.2-59.5 36.1-25.3 44.1-6.5 110 18.2 145.6 12.1 17.5 26.5 37.1 45.4 36.3 18.2-.7 25-11.7 47-11.7s28.1 11.7 47.1 11.3c19.2-.4 31.9-17.8 43.6-35 13.5-19.8 19-38.9 19.3-39.9-.4-.1-37-14.2-37.2-56.3zM276.4 135.3c10.1-12.3 16.9-29.3 15-46.3-14.6.6-32.3 9.8-42.8 22.1-9.4 11-17.6 28.5-15.4 45.1 16.2 1.3 33-8.6 43.2-20.9z" />
              </svg>
              <div className={styles.storeLabel}>
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </a>
            <a className={styles.storeBtn} href="#" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 512 512" aria-label="Google Play logo">
                <path fill="#4db6ac" d="M79.4 33.2C72.8 40.1 69 50.8 69 64.1v383.8c0 13.3 3.8 24 10.4 30.9l2.1 2.1L301 261.4v-5.4L81.5 31.1z" />
                <path fill="#dce775" d="M375.4 336.5l-74.4-74.4v-4.1l74.4-74.4 2.1 1.2 88.2 50.1c25.2 14.3 25.2 37.7 0 52l-88.2 50.1z" />
                <path fill="#ef5350" d="M377.5 337.7l-76.5-76.5-221.7 221.7c8.5 9 22.4 10.2 38.1 1.3l259.9-147.8" />
                <path fill="#2196f3" d="M377.5 174.3L117.6 26.5c-15.7-8.9-29.6-7.7-38.1 1.3l221.7 221.7 76.5-76.5z" />
              </svg>
              <div className={styles.storeLabel}>
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>
          </div>
        </div>

        {/* Right */}
        <div className={styles.right}>
          <PhoneMockup />
        </div>

      </div>
    </main>
  );
}
