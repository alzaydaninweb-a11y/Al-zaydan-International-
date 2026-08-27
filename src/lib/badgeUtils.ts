export type BadgeColor = 'red' | 'green' | 'blue' | 'amber' | 'purple' | 'black' | 'rose';
export type BadgeShape = 'pill' | 'rounded' | 'ribbon' | 'square';
export type BadgeStyle = 'solid' | 'soft' | 'outline';

export function getHeroBadgeClasses(
  color: string = 'red',
  shape: string = 'pill',
  style: string = 'solid'
): string {
  let shapeClass = 'rounded-full';
  if (shape === 'rounded') shapeClass = 'rounded-lg';
  else if (shape === 'square') shapeClass = 'rounded-xs';
  else if (shape === 'ribbon') shapeClass = 'rounded-l-none rounded-r-full pl-2 pr-3';

  if (style === 'soft') {
    switch (color) {
      case 'green':  return `${shapeClass} bg-emerald-50 text-emerald-700 border border-emerald-200`;
      case 'blue':   return `${shapeClass} bg-blue-50 text-blue-700 border border-blue-200`;
      case 'amber':  return `${shapeClass} bg-amber-50 text-amber-800 border border-amber-200`;
      case 'purple': return `${shapeClass} bg-purple-50 text-purple-700 border border-purple-200`;
      case 'black':  return `${shapeClass} bg-slate-100 text-slate-800 border border-slate-300`;
      case 'rose':   return `${shapeClass} bg-rose-50 text-rose-700 border border-rose-200`;
      case 'red':
      default:       return `${shapeClass} bg-red-50 text-red-700 border border-red-200`;
    }
  }

  if (style === 'outline') {
    switch (color) {
      case 'green':  return `${shapeClass} bg-white text-emerald-600 border-1.5 border-emerald-500`;
      case 'blue':   return `${shapeClass} bg-white text-blue-600 border-1.5 border-blue-500`;
      case 'amber':  return `${shapeClass} bg-white text-amber-600 border-1.5 border-amber-500`;
      case 'purple': return `${shapeClass} bg-white text-purple-600 border-1.5 border-purple-500`;
      case 'black':  return `${shapeClass} bg-white text-slate-900 border-1.5 border-slate-900`;
      case 'rose':   return `${shapeClass} bg-white text-rose-600 border-1.5 border-rose-500`;
      case 'red':
      default:       return `${shapeClass} bg-white text-red-600 border-1.5 border-red-500`;
    }
  }

  // Solid (default)
  switch (color) {
    case 'green':  return `${shapeClass} bg-emerald-600 text-white shadow-xs`;
    case 'blue':   return `${shapeClass} bg-blue-600 text-white shadow-xs`;
    case 'amber':  return `${shapeClass} bg-amber-500 text-white shadow-xs`;
    case 'purple': return `${shapeClass} bg-purple-600 text-white shadow-xs`;
    case 'black':  return `${shapeClass} bg-slate-900 text-white shadow-xs`;
    case 'rose':   return `${shapeClass} bg-rose-500 text-white shadow-xs`;
    case 'red':
    default:       return `${shapeClass} bg-red-500 text-white shadow-xs`;
  }
}
