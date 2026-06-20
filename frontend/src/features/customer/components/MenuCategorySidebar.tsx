import React from 'react';

interface MenuCategorySidebarProps {
  categories: string[];
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

export const MenuCategorySidebar: React.FC<MenuCategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  const handleCategoryClick = (cat: string) => {
    onCategorySelect(cat);
    // Smooth scroll to the category element if it exists in the DOM
    const slug = cat.toLowerCase().replace(/ /g, '-');
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Desktop Sticky Vertical Sidebar (md and up) */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-24 self-start bg-[#110E1C]/60 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-500 mb-4 px-2">
          Categories
        </h2>
        <nav className="flex flex-col gap-1.5">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/20 font-bold'
                    : 'text-neutral-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Horizontal Scroll pillbar (below md) */}
      <div className="block md:hidden w-full sticky top-20 bg-[#08070F]/90 backdrop-blur-md border-b border-white/5 z-20 py-3 overflow-x-auto scrollbar-hide px-4 -mx-4">
        <div className="flex gap-2.5">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-[#110E1C]/80 border-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MenuCategorySidebar;
