/** '#/' landing (owner: scaffold): choose Tặng quà (gift creator) or Photobooth. Original procedural art. */
import './Landing.css';
import { t } from '../../i18n';
import { encodeGiftSync, sampleGift } from '../../gift-schema';
import { hrefFor } from '../router';
import { ReducedMotionToggle } from '../ReducedMotionToggle';

function EnvelopeArt() {
  return (
    <svg className="landing-art" viewBox="0 0 120 90" aria-hidden="true">
      <rect className="la-env" x="6" y="18" width="108" height="66" rx="6" />
      <path className="la-env-flap" d="M6 24 L60 58 L114 24 L114 22 Q114 18 108 18 L12 18 Q6 18 6 22 Z" />
      <circle className="la-seal" cx="60" cy="56" r="9" />
      <g className="la-flower" transform="translate(96 16)">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} rx="7" ry="5" transform={`rotate(${a}) translate(6 0)`} />)}
        <circle className="la-flower-core" r="4" />
      </g>
    </svg>
  );
}

function BoothArt() {
  return (
    <svg className="landing-art" viewBox="0 0 120 90" aria-hidden="true">
      <rect className="la-booth" x="30" y="4" width="60" height="82" rx="8" />
      <rect className="la-booth-window" x="40" y="14" width="40" height="30" rx="4" />
      <circle className="la-lens" cx="60" cy="29" r="8" />
      <rect className="la-slot" x="44" y="56" width="32" height="5" rx="2.5" />
      <g transform="translate(84 40) rotate(8)">
        <rect className="la-strip" width="22" height="46" rx="1.5" />
        {[0, 1, 2].map((i) => <rect key={i} className="la-strip-cell" x="3" y={3 + i * 11} width="16" height="9" />)}
      </g>
    </svg>
  );
}

export default function Landing() {
  const sampleHref = hrefFor({ name: 'gift', param: encodeGiftSync(sampleGift) });
  return (
    <main className="app-scene landing" data-theme="garden-envelope">
      <header className="landing-head">
        <h1 className="landing-title">{t('landing.title')}</h1>
        <p className="landing-sub">{t('landing.subtitle')}</p>
      </header>
      <nav className="landing-choices" aria-label={t('app.title')}>
        <a className="landing-card" href={hrefFor({ name: 'create' })} data-testid="choose-gift">
          <EnvelopeArt />
          <span className="landing-card-title">{t('landing.gift')}</span>
          <span className="landing-card-hint">{t('landing.giftHint')}</span>
        </a>
        <a className="landing-card landing-card--booth" href={hrefFor({ name: 'booth' })} data-testid="choose-booth">
          <BoothArt />
          <span className="landing-card-title">{t('landing.booth')}</span>
          <span className="landing-card-hint">{t('landing.boothHint')}</span>
        </a>
      </nav>
      <p className="landing-links">
        <a href={sampleHref} data-testid="sample-gift">{t('landing.sample')}</a>
        <span aria-hidden="true"> · </span>
        <a href={hrefFor({ name: 'lab' })}>{t('lab.title')}</a>
      </p>
      <footer className="landing-foot"><ReducedMotionToggle /></footer>
    </main>
  );
}
