"use client";

interface ColorSwatchProps {
  colors: { name: string; hex: string }[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ColorSwatch({ colors, selectedIndex, onSelect }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-2 mt-2">
      {colors.map((color, index) => (
        <button
          key={color.name}
          onClick={() => onSelect(index)}
          aria-label={`Select ${color.name} color`}
          className="rounded-full transition-transform duration-200 hover:scale-125"
          style={{
            width: "14px",
            height: "14px",
            backgroundColor: color.hex,
            border: index === selectedIndex
              ? "2px solid #1A1A1A"
              : color.hex === "#EBF3EC" || color.hex === "#FFFFFF"
              ? "1px solid #C2D6C6"
              : "none",
            outline: index === selectedIndex ? "1px solid #1A1A1A" : "none",
            outlineOffset: "2px",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}
