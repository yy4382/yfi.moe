import { clsx, type ClassValue } from "clsx";

/** Join semantic and externally supplied classes; StyleX handles style conflicts. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
