import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryPillProps {
  name: string;
  slug: string;
  image?: string;
  emoji?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ name, slug, image, emoji, isActive, onClick }) => {
  const content = (
    <div
      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 min-w-[90px] group ${
        isActive
          ? 'bg-primary/15 border-primary/40 text-primary shadow-lg shadow-primary/10'
          : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white'
      }`}
      onClick={onClick}
    >
      {image ? (
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/30 transition-colors">
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
        </div>
      ) : (
        <span className="text-2xl">{emoji || '🍽️'}</span>
      )}
      <span className="text-xs font-semibold whitespace-nowrap">{name}</span>
    </div>
  );

  if (onClick) return content;

  return (
    <Link to={`/search?category=${slug}`}>
      {content}
    </Link>
  );
};

export default CategoryPill;
