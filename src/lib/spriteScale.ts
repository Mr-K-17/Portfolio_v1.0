/**
 * One source of truth for Pikachu sprite scaling across the portfolio.
 * Integer scales only to prevent distortion of pixel art assets.
 */
export const HERO_SCALE = 1;
export const RUNNER_SCALE = 1;

export const PIKACHU_METRICS = {
  walkCellW: 48,
  walkCellH: 55,
  jumpCellW: 41,
  jumpCellH: 60,
  idleCellW: 41,
  idleCellH: 34,
  idle2CellW: 43,
  idle2CellH: 43,
  idle3CellW: 44,
  idle3CellH: 33,
  maxCellW: 48,
  maxCellH: 60,
} as const;

export const HERO_SPRITE_W = PIKACHU_METRICS.maxCellW * HERO_SCALE; // 48px
export const HERO_SPRITE_H = PIKACHU_METRICS.walkCellH * HERO_SCALE; // 55px
export const HERO_SPRITE_MAX_H = PIKACHU_METRICS.maxCellH * HERO_SCALE; // 60px

export const RUNNER_SPRITE_W = PIKACHU_METRICS.walkCellW * RUNNER_SCALE; // 48px
export const RUNNER_SPRITE_H = PIKACHU_METRICS.walkCellH * RUNNER_SCALE; // 55px
export const RUNNER_SPRITE_MAX_H = PIKACHU_METRICS.maxCellH * RUNNER_SCALE; // 60px
