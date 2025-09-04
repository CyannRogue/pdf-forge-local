import * as Icons from 'lucide-react'

export function getIcon(name: string) {
  const key = (name.charAt(0).toUpperCase() + name.slice(1)) as keyof typeof Icons
  return (Icons as any)[key] || Icons.Square
}

