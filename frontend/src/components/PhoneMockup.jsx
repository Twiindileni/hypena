import styles from './PhoneMockup.module.css';

export default function PhoneMockup() {
  return (
    <div className={styles.phoneWrap}>
      <div className={styles.phoneShell}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>
          <div className={styles.screenHeader}>
            <span className={styles.back}>‹</span>
            <span className={styles.title}>Service Details</span>
            <span className={styles.bell}>🔔</span>
          </div>
          <div className={styles.heroImg}>
            <span>🍖</span>
          </div>
          <div className={styles.content}>
            <div className={styles.tags}>
              <span className={styles.tag}>Food and Drinks</span>
              <span className={styles.tag}>Catering</span>
            </div>
            <div className={styles.bizName}>Lyaelamwa Catering Services CC</div>
            <div className={styles.location}>
              <span>📍</span>
              <span>Windhoek, House No 9, Suiderhof</span>
            </div>
            <div className={styles.descLabel}>Description:</div>
            <div className={styles.descText}>
              LYAELAMWA Catering is a premier catering service that brings a unique fusion of
              traditional and contemporary flavours to every event, crafted with care.
            </div>
            <div className={styles.dirBtn}>Get Directions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
