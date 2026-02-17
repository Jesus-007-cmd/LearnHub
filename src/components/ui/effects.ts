// src/components/ui/effects.ts
import { motionSafe, motionSafeFast, reduceMotionSafe } from "./motion";

export const btnSoft =
  `rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 ` +
  `${motionSafeFast} ${reduceMotionSafe}`;

export const btnPrimary =
  `rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 ` +
  `${motionSafeFast} ${reduceMotionSafe}`;

export const chip =
  `rounded-full px-3 py-1 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10 ` +
  `hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] ` +
  `${motionSafeFast} ${reduceMotionSafe}`;

export const chipActive =
  `rounded-full px-3 py-1 text-sm bg-white text-slate-950 ` +
  `${motionSafeFast} ${reduceMotionSafe}`;
