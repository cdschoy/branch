/** Lab: the 600×1800 strip compositor per frame theme, with procedural sample shots (owner: booth). */
import { useEffect, useState } from 'react';
import type { LabEntry } from '../lab/registry';
import { useLocale } from '../useLocale';
import { t, formatDate, formatLunar } from '../../i18n';
import { composeStripCanvas, FRAMES, loadStripFonts, resolvePalette, vnDateParts, type FrameTheme, type Shot } from '../../booth';

/** Original placeholder "photo": theme-coloured backdrop with a round subject (no reference art). */
function sampleShot(i: number, theme: FrameTheme): Shot {
  const p = resolvePalette(theme);
  const c = document.createElement('canvas');
  c.width = 640; c.height = 480;
  const g = c.getContext('2d')!;
  g.fillStyle = i % 2 ? p.paper : p.accent; g.fillRect(0, 0, 640, 480);
  g.fillStyle = p.motif; g.beginPath(); g.arc(320 + (i - 1.5) * 60, 300, 130, 0, Math.PI * 2); g.fill();
  g.fillStyle = p.frame; g.beginPath(); g.arc(320 + (i - 1.5) * 60, 140, 70, 0, Math.PI * 2); g.fill();
  return { bitmap: c, at: 0, mirrored: false };
}

function StripDemo({ theme }: { theme: FrameTheme }) {
  const locale = useLocale();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void loadStripFonts().then(() => {
      if (!alive) return;
      const { d, m, y, lunar } = vnDateParts();
      const c = composeStripCanvas([0, 1, 2, 3].map((i) => sampleShot(i, theme)), {
        frameColor: resolvePalette(theme).frame, palette: resolvePalette(theme), motif: theme.motif, filter: 'natural', seed: 7,
        footerText: t('booth.caption.default'),
        date: t('booth.footer.date', { solar: formatDate(d, m, y), lunar: formatLunar(lunar) }),
      });
      setUrl(c.toDataURL('image/png'));
    });
    return () => { alive = false; };
  }, [theme, locale]);
  return url ? <img src={url} alt={t(theme.labelKey)} style={{ height: 300, width: 100, display: 'block', margin: '0 auto', boxShadow: 'var(--shadow-photo)' }} /> : null;
}

const entries: LabEntry[] = FRAMES.map((f) => ({
  id: `booth.strip.${f.id}`,
  get title() { return `${t('booth.lab.strip')} · ${t(f.labelKey)}`; }, // read at render: follows the locale
  group: 'booth',
  owner: 'booth',
  notes: 'proportion.photoStrip: 600×1800, cells 486×364 at x57 / y36 + i·382, footer 254; date dd/mm/yyyy · lunar',
  height: 320,
  theme: 'booth-stripes',
  render: () => <StripDemo theme={f} />,
}));

export default entries;
