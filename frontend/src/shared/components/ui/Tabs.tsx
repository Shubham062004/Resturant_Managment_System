import { motion } from 'framer-motion';
import React from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange, className = '' }) => {
  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* Tabs Header bar */}
      <div className="flex border-b border-border/60 overflow-x-auto scrollbar-none">
        <nav className="flex gap-6 min-w-full">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`relative pb-3 text-sm font-semibold font-display transition-colors focus:outline-none flex-shrink-0
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tabs Panel */}
      <div role="tabpanel" className="w-full">
        {tabs.find((t) => t.id === activeTabId)?.content}
      </div>
    </div>
  );
};

export default Tabs;
