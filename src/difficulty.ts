export type Difficulty = 'easy' | 'medium' | 'hard';

export function getDifficulty(userAge: number): Difficulty {
  if (userAge < 6) return 'easy';
  if (userAge <= 8) return 'medium';
  return 'hard';
}
