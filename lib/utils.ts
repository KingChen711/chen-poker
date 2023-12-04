import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// chatgpt
export function generateRoomCode() {
  // Generate a random number between 0 and 16777215 (0xFFFFFF in decimal)
  const randomDecimal = Math.floor(Math.random() * 16777215)

  // Convert the decimal number to hexadecimal and pad with zeros if needed
  const hexCode = randomDecimal.toString(16).padStart(6, '0')

  return hexCode.toUpperCase()
}
