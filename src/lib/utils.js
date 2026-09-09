import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Universal classname merger for 21st.dev / shadcn components
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
