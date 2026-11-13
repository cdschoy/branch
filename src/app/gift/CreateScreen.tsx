/**
 * '#/create' creator (FRAMEWORK §5.2; owner: gift). Draft-first: the draft autosaves to localStorage
 * (try/catch; `common.draftSaved` is a 0 ms label). Steps (machines/creator.ts): mechanic · theme ·
 * people → photos · letter · songs → review, shown as three group dots (never a step counter).
 * The preview plays the REAL recipient player at ×3; "Tạo liên kết" encodes the gift into the URL
 * hash (`#/g/<encodeGift(draft)>`) with a copy button. No backend: see api/README.md for the seam.
 */
import './create.css';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import strings from '@strings/vi.json';
import { themes } from '../../motion/core/tokens';
import { t, nfc, graphemeCount, type PronounSetId, type StringKey, type Voice } from '../../i18n';
import { encodeGift, resolveMedia, type GiftContentV1, type LetterFont, type LetterPage, type MemoriesPage, type Photo, type SongsPage } from '../../gift-schema';
import { creatorMachine, creatorGroup, letterOf, photosOf, peopleError, photosError, letterError, NAME_MAX, BODY_MAX, useMachine, type CreatorState } from '../../machines';
import { LetterCard, Pill, Polaroid } from '../../ui';
import { hrefFor, navigate } from '../router';
import { EnvelopeClosed, BoxBody } from './art';
import { GiftPlayer } from './GiftPlayer';
import { MEDIA, G } from './params';
import { downscalePhoto, photoChars } from './photos';
import { newGiftId, serviceOf } from './util';

const DRAFT_KEY = 'gift:draft:v1';
type ThemeKey = keyof typeof themes;
const THEMES = Object.keys(themes) as ThemeKey[];
const PRONOUNS = Object.keys(strings.pronouns) as PronounSetId[];
const FONTS: { id: LetterFont; key: StringKey }[] = [
  { id: 'handBody', key: 'create.letter.fontHandBody' },
  { id: 'scriptSignature', key: 'create.letter.fontScriptSignature' },
  { id: 'scriptDisplay', key: 'create.letter.fontScriptDisplay' },
];
const GROUPS: StringKey[] = ['create.group.prepare', 'create.group.content', 'create.group.send'];
const STEP_KEY: Record<CreatorState, StringKey> = {
  mechanic: 'create.step.mechanic', theme: 'create.step.theme', people: 'create.step.people', photos: 'create.step.photos',
  letter: 'create.step.letter', songs: 'create.step.songs', review: 'create.step.review', published: 'create.step.review',
};

interface Saved { draft: GiftContentV1; pronoun: PronounSetId }

function blankDraft(): GiftContentV1 {
  return {
    v: 1, id: newGiftId(), mechanic: 'envelope', theme: 'garden-envelope', locale: 'vi',
    names: { from: '', to: '', self: 'anh', you: 'em', tone: 'nha' },
    pages: [{ kind: 'letter', greeting: '', body: '', signature: '', font: 'handBody' }],
    mediaRefs: [], finale: { enabled: true },
  };
}
function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    return s?.draft?.names && Array.isArray(s.draft.pages) ? s : null;
  } catch { return null; }
}

/** Pronoun set → the words stored on the gift (`none` uses the recipient's name for "you"). */
function namesFor(set: PronounSetId, to: string): { self: string; you: string; pronouns: PronounSetId } {
  const p = strings.pronouns[set];
  return { self: p.self, you: set === 'none' ? (nfc(to).trim() || p.self) : p.you, pronouns: set };
}

/** Replace one page kind (or remove it with null). */
function withPage(d: GiftContentV1, kind: GiftContentV1['pages'][number]['kind'], page: GiftContentV1['pages'][number] | null): GiftContentV1['pages'] {
  const rest = d.pages.filter((p) => p.kind !== kind);
  return page ? [...rest, page] : rest;
}

/** The gift as published: defaults for the optional letter fields. */
function finalGift(d: GiftContentV1): GiftContentV1 {
  const l = letterOf(d);
  const greeting = nfc(l?.greeting ?? '').trim() || t('gift.letter.salutation', { recipientName: nfc(d.names.to).trim() });
  const signature = nfc(l?.signature ?? '').trim() || nfc(d.names.from).trim();
  const letter: LetterPage = { kind: 'letter', greeting, body: nfc(l?.body ?? ''), signature, font: l?.font ?? 'handBody' };
  return {
    ...d,
    names: { ...d.names, from: nfc(d.names.from).trim(), to: nfc(d.names.to).trim() },
    pages: [letter, ...d.pages.filter((p) => p.kind !== 'letter')],
  };
}

export default function CreateScreen() {
  const saved = useMemo(loadSaved, []);
  const [snap, send] = useMachine(creatorMachine, { draft: saved?.draft ?? blankDraft(), consent: (saved?.draft && photosOf(saved.draft).length > 0) || false });
  const draft = snap.context.draft!;
  const step = snap.value;
  const [pronoun, setPronoun] = useState<PronounSetId>(saved?.pronoun ?? 'anh-em');
  const [savedLabel, setSavedLabel] = useState(false);
  const [preview, setPreview] = useState(0);
  const [tried, setTried] = useState(false);
  const edit = (patch: Partial<GiftContentV1>) => send({ type: 'EDIT', patch });

  // draft-first autosave (debounced; quota errors are non-fatal)
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, pronoun } satisfies Saved)); setSavedLabel(true); } catch { setSavedLabel(false); }
    }, G.chrome.secondaryMs);
    return () => clearTimeout(id);
  }, [draft, pronoun]);

  useEffect(() => { setTried(false); window.scrollTo(0, 0); }, [step]);

  const voice: Voice = { pronouns: pronoun, self: draft.names.self, you: draft.names.you, tone: draft.names.tone, recipientName: draft.names.to || '…' };
  const group = creatorGroup(step);
  const err: StringKey | null = step === 'people' ? peopleError(draft) : step === 'photos' ? photosError(draft, snap.context.consent) : step === 'letter' ? letterError(draft) : null;
  const next = () => { setTried(true); if (!err) send({ type: 'NEXT' }); };
  const optional = step === 'photos' || step === 'songs';

  return (
    <main className="app-scene create" data-theme={draft.theme} data-step={step} data-testid="create">
      <header className="create__head">
        <a className="create__home" href={hrefFor({ name: 'landing' })}>{t('app.home')}</a>
        <h1 className="create__title">{t('create.title')}</h1>
        <span className="create__saved" aria-live="polite">{savedLabel ? t('common.draftSaved') : ''}</span>
      </header>
      <ol className="create__groups" aria-label={t(STEP_KEY[step])}>
        {GROUPS.map((k, i) => (
          <li key={k} className="create__group" data-on={i === group || undefined} data-done={i < group || undefined} aria-current={i === group ? 'step' : undefined}>
            <span className="create__dot" aria-hidden="true" />{t(k)}
          </li>
        ))}
      </ol>

      <section className="create__step" aria-labelledby="create-step-title">
        <h2 id="create-step-title" className="create__steptitle">{t(STEP_KEY[step])}</h2>
        {step === 'mechanic' ? <MechanicStep draft={draft} edit={edit} /> : null}
        {step === 'theme' ? <ThemeStep draft={draft} edit={edit} /> : null}
        {step === 'people' ? <PeopleStep draft={draft} edit={edit} pronoun={pronoun} setPronoun={setPronoun} voice={voice} /> : null}
        {step === 'photos' ? <PhotosStep draft={draft} edit={edit} consent={snap.context.consent} setConsent={(v) => send({ type: 'CONSENT', value: v })} /> : null}
        {step === 'letter' ? <LetterStep draft={draft} edit={edit} voice={voice} /> : null}
        {step === 'songs' ? <SongsStep draft={draft} edit={edit} /> : null}
        {step === 'review' || step === 'published' ? (
          <ReviewStep draft={draft} param={snap.context.param} onPreview={() => setPreview((n) => n + 1)}
            onPublish={async () => send({ type: 'PUBLISH', param: await encodeGift(finalGift(draft)) })}
            onEdit={() => send({ type: 'UNPUBLISH' })} />
        ) : null}
        {tried && err ? <p className="create__error" role="alert">{t(err, { max: err === 'create.message.tooLong' ? BODY_MAX : NAME_MAX })}</p> : null}
      </section>

      {step !== 'published' ? (
        <nav className="create__nav">
          {step !== 'mechanic' ? <Pill variant="link" onClick={() => send({ type: 'BACK' })}>{t('common.back')}</Pill> : <span />}
          <span className="create__navright">
            {optional ? <Pill variant="link" onClick={() => send({ type: 'SKIP' })}>{t('common.skip')}</Pill> : null}
            {step !== 'review' ? <span data-testid="create-next"><Pill variant="action" onClick={next}>{t('common.next')}</Pill></span> : null}
          </span>
        </nav>
      ) : null}

      {preview ? (
        <div className="create__preview" role="dialog" aria-modal="true" aria-label={t('create.preview.cta')} data-testid="create-preview">
          <GiftPlayer key={preview} gift={finalGift(draft)} timeScale={G.previewTimeScale} preview />
          <div className="create__previewbar">
            <Pill variant="status">{t('create.preview.badge')}</Pill>
            <Pill variant="action" onClick={() => setPreview(0)}>{t('create.preview.close')}</Pill>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/* ------------------------------------------------------------------ steps */

interface StepProps { draft: GiftContentV1; edit: (p: Partial<GiftContentV1>) => void }

function Choice({ name, checked, onChange, children, testId }: { name: string; checked: boolean; onChange: () => void; children: ReactNode; testId?: string }) {
  return (
    <label className="create__choice" data-on={checked || undefined} data-testid={testId}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="visually-hidden" />
      {children}
    </label>
  );
}

function MechanicStep({ draft, edit }: StepProps) {
  const opts = [
    { id: 'envelope' as const, label: 'create.mechanic.envelope' as const, hint: 'create.mechanic.envelopeHint' as const, art: <EnvelopeClosed /> },
    { id: 'box' as const, label: 'create.mechanic.box' as const, hint: 'create.mechanic.boxHint' as const, art: <BoxBody /> },
  ];
  return (
    <div className="create__grid">
      <p className="create__prompt">{t('create.mechanic.prompt')}</p>
      {opts.map((o) => (
        <Choice key={o.id} name="mechanic" checked={draft.mechanic === o.id} onChange={() => edit({ mechanic: o.id, theme: o.id === 'box' && draft.theme === 'garden-envelope' ? 'sweet-gingham' : draft.theme })} testId={`mechanic-${o.id}`}>
          <span className="create__card-art" data-theme={o.id === 'box' ? 'sweet-gingham' : 'garden-envelope'}>{o.art}</span>
          <span className="create__card-text"><strong>{t(o.label)}</strong><span>{t(o.hint)}</span></span>
        </Choice>
      ))}
    </div>
  );
}

function ThemeStep({ draft, edit }: StepProps) {
  return (
    <div className="create__themes">
      <p className="create__prompt">{t('create.theme.prompt')}</p>
      {THEMES.map((id) => (
        <Choice key={id} name="theme" checked={draft.theme === id} onChange={() => edit({ theme: id })} testId={`theme-${id}`}>
          <span className="create__swatch" data-theme={id} aria-hidden="true"><i /><i /><i /></span>
          <span>{t(themes[id].labelKey as StringKey)}</span>
        </Choice>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, hint, max, multiline, testId }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; max?: number; multiline?: boolean; testId?: string;
}) {
  // No keydown filtering (Telex / VNI IMEs compose through input events); NFC on every input (§6.4).
  const common = { value, placeholder, 'data-testid': testId, onChange: (e: { target: { value: string } }) => onChange(nfc(e.target.value)) };
  const n = graphemeCount(value);
  return (
    <label className="create__field">
      <span className="create__label">{label}</span>
      {multiline ? <textarea rows={7} {...common} /> : <input type="text" autoComplete="off" {...common} />}
      {hint ? <span className="create__hint">{hint}</span> : null}
      {max ? <span className="create__counter" data-over={n > max || undefined}>{t('create.message.counter', { count: n, max })}</span> : null}
    </label>
  );
}

function PeopleStep({ draft, edit, pronoun, setPronoun, voice }: StepProps & { pronoun: PronounSetId; setPronoun: (p: PronounSetId) => void; voice: Voice }) {
  const setNames = (patch: Partial<GiftContentV1['names']>, set = pronoun) => {
    const names = { ...draft.names, ...patch };
    edit({ names: { ...names, ...namesFor(set, names.to) } });
  };
  return (
    <div className="create__form">
      <TextField label={t('create.names.nickname')} value={draft.names.to} onChange={(v) => setNames({ to: v })} placeholder={t('create.names.nicknamePlaceholder')} hint={t('create.names.hint')} max={NAME_MAX} testId="create-to" />
      <TextField label={t('create.names.sender')} value={draft.names.from} onChange={(v) => setNames({ from: v })} max={NAME_MAX} testId="create-from" />
      <fieldset className="create__fieldset">
        <legend className="create__label">{t('create.pronouns.prompt')}</legend>
        <span className="create__hint">{t('create.pronouns.help')}</span>
        <div className="create__chips">
          {PRONOUNS.map((p) => (
            <Choice key={p} name="pronoun" checked={pronoun === p} onChange={() => { setPronoun(p); setNames({}, p); }} testId={`pronoun-${p}`}>
              {t(strings.pronouns[p].label as StringKey)}
            </Choice>
          ))}
        </div>
        <p className="create__example">{t('create.pronouns.preview', { example: t('gift.landing.from', {}, voice) })}</p>
      </fieldset>
      <fieldset className="create__fieldset">
        <legend className="create__label">{t('create.tone.prompt')}</legend>
        <div className="create__chips">
          <Choice name="tone" checked={draft.names.tone === 'nhe'} onChange={() => setNames({ tone: 'nhe' })}>{t('create.tone.north')}</Choice>
          <Choice name="tone" checked={draft.names.tone === 'nha'} onChange={() => setNames({ tone: 'nha' })}>{t('create.tone.south')}</Choice>
        </div>
      </fieldset>
    </div>
  );
}

function PhotosStep({ draft, edit, consent, setConsent }: StepProps & { consent: boolean; setConsent: (v: boolean) => void }) {
  const photos = photosOf(draft);
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState<StringKey | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const chars = photoChars(photos.map((p) => p.ref));
  const setPhotos = (list: Photo[]) => edit({ pages: withPage(draft, 'memories', list.length ? { kind: 'memories', photos: list } satisfies MemoriesPage : null) });

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setWarn(null);
    const list = [...photos];
    let total = chars;
    for (const f of Array.from(files)) {
      if (list.length >= MEDIA.maxPhotos) { setWarn('create.photos.limit'); break; }
      try {
        const ref = await downscalePhoto(f);
        if (total + ref.length > MEDIA.maxChars) { setWarn('create.photos.tooHeavy'); break; }
        total += ref.length;
        list.push({ ref });
      } catch { setWarn('create.photos.failed'); }
    }
    setPhotos(list);
    setBusy(false);
    if (input.current) input.current.value = '';
  };

  return (
    <div className="create__form">
      <p className="create__hint">{t('create.photos.local')}</p>
      <div className="create__photos">
        {photos.map((p, i) => (
          <div key={i} className="create__photo">
            <Polaroid src={resolveMedia(p.ref)} caption={p.caption} index={i} seed={7} width={96} />
            <input type="text" className="create__caption" placeholder={t('create.photos.caption')} value={p.caption ?? ''}
              onChange={(e) => { const v = nfc(e.target.value); if (graphemeCount(v) <= MEDIA.captionGraphemes) setPhotos(photos.map((x, j) => (j === i ? { ...x, caption: v || undefined } : x))); }} />
            <button type="button" className="create__remove" aria-label={t('create.photos.remove', { index: i + 1 })} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
      </div>
      <label className="create__add" data-disabled={photos.length >= MEDIA.maxPhotos || busy || undefined}>
        <input ref={input} type="file" accept="image/*" multiple className="visually-hidden" data-testid="create-photo-input"
          disabled={photos.length >= MEDIA.maxPhotos || busy} onChange={(e) => void add(e.target.files)} />
        <span>{busy ? t('common.loading') : t('create.photos.add')}</span>
      </label>
      <p className="create__counter" data-testid="create-photo-count">{t('create.photos.count', { count: photos.length, max: MEDIA.maxPhotos })} · {t('create.photos.limit', { max: MEDIA.maxPhotos })}</p>
      {chars > MEDIA.warnChars ? <p className="create__warn" role="status">{t('create.link.long')}</p> : null}
      {warn ? <p className="create__warn" role="status">{t(warn, { max: MEDIA.maxPhotos })}</p> : null}
      {photos.length ? (
        <label className="create__check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="create-consent" />
          <span>{t('create.photos.consent')}</span>
        </label>
      ) : null}
    </div>
  );
}

function LetterStep({ draft, edit, voice }: StepProps & { voice: Voice }) {
  const l = letterOf(draft) ?? { kind: 'letter' as const, greeting: '', body: '', signature: '' };
  const [demo, setDemo] = useState(0);
  const set = (patch: Partial<LetterPage>) => edit({ pages: withPage(draft, 'letter', { ...l, ...patch }) });
  const suggestions: StringKey[] = ['create.message.suggest1', 'create.message.suggest2', 'create.message.suggest3'];
  const greeting = l.greeting || t('gift.letter.salutation', { recipientName: draft.names.to });
  return (
    <div className="create__form">
      <TextField label={t('create.letter.greeting')} value={l.greeting} onChange={(v) => set({ greeting: v })} placeholder={t('gift.letter.salutation', { recipientName: draft.names.to })} />
      <div className="create__chips" aria-label={t('create.message.suggestions')}>
        {suggestions.map((k) => (
          <button key={k} type="button" className="create__suggest" onClick={() => set({ body: l.body ? `${l.body} ${t(k, {}, voice)}` : t(k, {}, voice) })}>{t(k, {}, voice)}</button>
        ))}
      </div>
      <TextField label={t('create.letter.body')} value={l.body} onChange={(v) => set({ body: v })} placeholder={t('create.message.placeholder')} max={BODY_MAX} multiline testId="create-body" />
      <TextField label={t('create.letter.signature')} value={l.signature} onChange={(v) => set({ signature: v })} placeholder={draft.names.from} />
      <fieldset className="create__fieldset">
        <legend className="create__label">{t('create.letter.font')}</legend>
        <div className="create__chips">
          {FONTS.map((f) => (
            <Choice key={f.id} name="font" checked={(l.font ?? 'handBody') === f.id} onChange={() => set({ font: f.id })}>
              <span className="create__fontname" data-font={f.id}>{t(f.key)}</span>
            </Choice>
          ))}
        </div>
      </fieldset>
      <Pill variant="link" onClick={() => setDemo((n) => n + 1)}>{t('create.message.previewTyping')}</Pill>
      {demo ? (
        <div className="create__letterdemo" data-testid="create-typing-demo">
          <LetterCard key={demo} eyebrow={t('gift.letter.eyebrow', {}, voice)} greeting={greeting} body={l.body || t('create.message.placeholder')}
            signature={l.signature || draft.names.from} font={l.font} typing />
        </div>
      ) : null}
    </div>
  );
}

function SongsStep({ draft, edit }: StepProps) {
  const tr = draft.pages.find((p): p is SongsPage => p.kind === 'songs')?.tracks[0];
  const [url, setUrl] = useState(tr?.url ?? '');
  const [title, setTitle] = useState(tr?.title ?? '');
  const service = serviceOf(url.trim());
  useEffect(() => {
    const u = url.trim();
    edit({ pages: withPage(draft, 'songs', u && service ? { kind: 'songs', tracks: [{ title: nfc(title).trim() || service, url: u }] } : null) });
  }, [url, title]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="create__form">
      <TextField label={t('create.music.link')} value={url} onChange={setUrl} placeholder={t('create.music.prompt')} testId="create-song-url" />
      <TextField label={t('create.music.title')} value={title} onChange={setTitle} placeholder={t('create.music.titlePlaceholder')} />
      {url.trim() ? <p className={service ? 'create__ok' : 'create__warn'} role="status">{service ? t('create.music.ok', { service }) : t('create.music.invalid')}</p> : null}
    </div>
  );
}

function ReviewStep({ draft, param, onPreview, onPublish, onEdit }: { draft: GiftContentV1; param: string | null; onPreview: () => void; onPublish: () => Promise<void>; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = param ? `${location.origin}${location.pathname}${hrefFor({ name: 'gift', param })}` : '';
  const g = finalGift(draft);
  const voice: Voice = { self: g.names.self, you: g.names.you, tone: g.names.tone, recipientName: g.names.to };
  const l = letterOf(g)!;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const ta = document.createElement('textarea'); ta.value = url; document.body.append(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ } ta.remove();
    }
    setCopied(true);
  };
  return (
    <div className="create__form">
      <p className="create__hint">{t('create.review.ready')}</p>
      <div className="create__summary" data-theme={g.theme}>
        <LetterCard eyebrow={t('gift.letter.eyebrow', {}, voice)} greeting={l.greeting} body={l.body} signature={l.signature} font={l.font} />
      </div>
      <div className="create__actions">
        <span data-testid="create-preview-btn"><Pill variant="link" onClick={onPreview}>{t('create.preview.cta')} · {t('create.preview.fastForward')}</Pill></span>
        {!param ? (
          <span data-testid="create-link-btn"><Pill variant="action" disabled={busy} onClick={async () => { setBusy(true); await onPublish(); setBusy(false); }}>{t('create.link.cta')}</Pill></span>
        ) : null}
      </div>
      {param ? (
        <div className="create__link" data-testid="create-link">
          <p className="create__label">{t('create.link.title')}</p>
          <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} data-testid="create-link-url" aria-label={t('create.link.title')} />
          {url.length > MEDIA.warnChars ? <p className="create__warn">{t('create.link.long')}</p> : null}
          <div className="create__actions">
            <Pill variant="action" onClick={() => void copy()}><span key={copied ? 'c' : 'n'}>{copied ? t('common.copied') : t('common.copyLink')}</span></Pill>
            <span data-testid="create-open-link"><Pill variant="link" onClick={() => navigate({ name: 'gift', param })}>{t('create.link.open')}</Pill></span>
            <Pill variant="link" onClick={onEdit}>{t('create.link.edit')}</Pill>
          </div>
        </div>
      ) : null}
    </div>
  );
}
