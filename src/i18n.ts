export type Lang = 'en' | 'vi' | 'both';

export type TextKey =
  | 'play'
  | 'back'
  | 'age'
  | 'stars'
  | 'badges'
  | 'language'
  | 'english'
  | 'vietnamese'
  | 'bilingual'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'difficulty'
  | 'gameUnavailable'
  | 'gameUnavailableHint';

export const TEXT: Record<TextKey, { en: string; vi: string }> = {
  play: { en: 'Play Now', vi: 'Chơi ngay' },
  back: { en: 'Back to Dashboard', vi: 'Về trang chính' },
  age: { en: 'Age', vi: 'Tuổi' },
  stars: { en: 'stars', vi: 'sao' },
  badges: { en: 'badges', vi: 'huy hiệu' },
  language: { en: 'Language', vi: 'Ngôn ngữ' },
  english: { en: 'EN', vi: 'EN' },
  vietnamese: { en: 'VI', vi: 'VI' },
  bilingual: { en: 'Both', vi: 'Song ngữ' },
  easy: { en: 'Easy', vi: 'Dễ' },
  medium: { en: 'Medium', vi: 'Vừa' },
  hard: { en: 'Hard', vi: 'Khó' },
  difficulty: { en: 'Difficulty', vi: 'Độ khó' },
  gameUnavailable: { en: 'Game unavailable', vi: 'Trò chơi chưa sẵn sàng' },
  gameUnavailableHint: {
    en: 'This game is still being improved or has been temporarily hidden.',
    vi: 'Trò chơi đang được cải thiện hoặc tạm ẩn.',
  },
};

export function t(lang: Lang, key: TextKey): string {
  const entry = TEXT[key];
  if (lang === 'en') return entry.en;
  if (lang === 'vi') return entry.vi;
  return `${entry.en} / ${entry.vi}`;
}
