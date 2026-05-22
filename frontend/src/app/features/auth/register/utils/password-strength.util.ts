import { PasswordStrength } from '../models/register.model';

/**
 * Pure function — no Angular, no side effects.
 * Computes password strength score and display metadata.
 */
export function computePasswordStrength(pass: string): PasswordStrength {
  if (!pass) return { score: 0, label: 'EMPTY', color: 'bg-gray-200' };
  if (pass.length < 6) return { score: 1, label: 'TOO SHORT', color: 'bg-red-400' };

  let score = 1;
  const metConditions = [
    /[a-z]/.test(pass),
    /[A-Z]/.test(pass),
    /[0-9]/.test(pass),
    /[^A-Za-z0-9]/.test(pass),
  ].filter(Boolean).length;

  if (metConditions >= 2) score++;
  if (pass.length >= 8 && metConditions >= 3) score++;
  if (pass.length >= 10 && metConditions === 4) score++;

  const levels: Record<number, PasswordStrength> = {
    1: { score: 1, label: 'WEAK',        color: 'bg-red-400'     },
    2: { score: 2, label: 'MEDIUM',      color: 'bg-amber-400'   },
    3: { score: 3, label: 'STRONG',      color: 'bg-emerald-400' },
    4: { score: 4, label: 'VERY STRONG', color: 'bg-purple-400'  },
  };
  return levels[score] ?? levels[4];
}
