import React from 'react';
import { 
  Home, Utensils, Car, Gamepad2, HeartPulse, GraduationCap, 
  ShoppingBag, Banknote, TrendingUp, Laptop, Tag, HelpCircle 
} from 'lucide-react';

// Mapa de ícones suportados no Seeding
const ICON_MAP: Record<string, React.ElementType> = {
  'Home': Home,
  'Utensils': Utensils,
  'Car': Car,
  'Gamepad2': Gamepad2,
  'HeartPulse': HeartPulse,
  'GraduationCap': GraduationCap,
  'ShoppingBag': ShoppingBag,
  'Banknote': Banknote,
  'TrendingUp': TrendingUp,
  'Laptop': Laptop,
  'Tag': Tag
};

interface CategoryIconProps {
  iconName?: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  color, 
  size = 18,
  className = ''
}) => {
  // 1. Se não tiver ícone, retorna fallback
  if (!iconName) {
      return <HelpCircle size={size} color={color} className={className} />;
  }

  // 2. Tenta encontrar no mapa de Lucide Icons
  const LucideIcon = ICON_MAP[iconName];

  // 3. Se encontrou componente Lucide, renderiza
  if (LucideIcon) {
      return <LucideIcon size={size} color={color} className={className} />;
  }

  // 4. Se não encontrou (pode ser um Emoji antigo ou string customizada), renderiza como texto/emoji
  return (
      <span 
        className={`flex items-center justify-center text-[${size}px] leading-none ${className}`} 
        style={{ fontSize: size, color: color }}
      >
          {iconName}
      </span>
  );
};