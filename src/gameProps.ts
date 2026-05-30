import type { Lang } from './i18n';

export type GameProps = {
  userAge: number;
  lang?: Lang;
  onGameComplete: (stars: number) => void;
};
