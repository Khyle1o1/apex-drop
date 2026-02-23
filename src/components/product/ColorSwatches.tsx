import type { Variant } from '@/lib/products';

interface ColorSwatchesProps {
  variants: Variant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
  size?: 'sm' | 'md';
}

export default function ColorSwatches({ variants, selectedId, onSelect, size = 'sm' }: ColorSwatchesProps) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Color options">
      {variants.map((v) => {
        const isSelected = v.variantId === selectedId;
        const isWhite = v.colorHex.toLowerCase() === '#ffffff' || v.colorHex.toLowerCase() === '#f8fafc';
        return (
          <button
            key={v.variantId}
            onClick={() => onSelect(v.variantId)}
            aria-label={v.colorName}
            title={v.colorName}
            role="radio"
            aria-checked={isSelected}
            className={`
              ${dim} rounded-full transition-all relative flex-shrink-0
              ${isWhite ? 'border border-border' : ''}
              ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'}
              ${v.stockStatus === 'outOfStock' ? 'opacity-40' : ''}
            `}
            style={{ backgroundColor: v.colorHex }}
          >
            {v.stockStatus === 'outOfStock' && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-full h-[1px] bg-foreground/60 rotate-45 absolute" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
