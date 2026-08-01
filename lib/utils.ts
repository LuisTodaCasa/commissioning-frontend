import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Combina classes Tailwind de forma segura (usado pelos componentes de UI). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
