/**
 * Primitive catalog (FRAMEWORK §4.2; owner: primitives). The lab lists every row; set `status: 'done'`
 * when a primitive is implemented and has a `*.lab.tsx` entry whose id matches `id`.
 */
export type PrimitiveStatus = 'stub' | 'done' | 'later';
export interface PrimitiveInfo { readonly id: string; readonly name: string; readonly export: string; readonly owner: 'primitives' | 'fx'; readonly status: PrimitiveStatus; readonly mvp: boolean }

export const PRIMITIVES: readonly PrimitiveInfo[] = [
  { id: 'P01', name: 'stampPop', export: 'StampPop', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P02', name: 'stickerPop', export: 'StickerPop', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P03', name: 'letterPop', export: 'LetterPop', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P04', name: 'polaroidDeal', export: 'PolaroidDeal', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P05', name: 'drawerSlide', export: 'DrawerSlide', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P06', name: 'textBlurIn', export: 'TextBlurIn', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P07', name: 'tooltipRise', export: 'TooltipRise', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P08', name: 'timedPrompt', export: 'TimedPrompt', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P10', name: 'whipOff', export: 'WhipOff', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P12', name: 'curtainDrop', export: 'CurtainDrop', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P14', name: 'hardCut', export: 'HardCut', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P15', name: 'tapWobble', export: 'useTapWobble', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P16', name: 'pressSquash', export: 'usePressSquash', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P17', name: 'hoverGrow', export: 'HoverGrow', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P18', name: 'biteTap', export: 'BiteTap', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P21', name: 'heartBurst', export: 'HeartBurst', owner: 'fx', status: 'done', mvp: true },
  { id: 'P22', name: 'confettiFountain', export: 'ConfettiFountain', owner: 'fx', status: 'done', mvp: true },
  { id: 'P23', name: 'cameraFlash', export: 'CameraFlash', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P25', name: 'idleFloat', export: 'IdleFloat', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P26', name: 'trapezoidSway', export: 'TrapezoidSway', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P27', name: 'pendulum', export: 'Pendulum', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P28', name: 'hintRing', export: 'HintPulse', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P29', name: 'reelSpin', export: 'ReelSpin', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P32', name: 'pageCrossfade', export: 'PageCrossfade', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P33', name: 'paperDipCrossfade', export: 'PaperDipCrossfade', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P34', name: 'lidFlip3D', export: 'LidFlip3D', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P36', name: 'sharedLightbox', export: 'SharedLightbox', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P37', name: 'slotPrint + toss', export: 'SlotPrint, Toss', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P38', name: 'flowerCurtain', export: 'FlowerCurtain', owner: 'fx', status: 'done', mvp: true },
  { id: 'P39', name: 'bloomBurst', export: "fx emitter 'bloom'", owner: 'fx', status: 'done', mvp: false },
  { id: 'P42', name: 'typewriter', export: 'Typewriter', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P44', name: 'idleWobble', export: 'IdleWobble', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P45', name: 'contentSwapInShell', export: 'ContentSwapInShell', owner: 'primitives', status: 'done', mvp: true },
  { id: 'P47', name: 'tokenDrop', export: 'TokenDrop', owner: 'primitives', status: 'done', mvp: true },
];
