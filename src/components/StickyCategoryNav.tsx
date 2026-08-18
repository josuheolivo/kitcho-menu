"use client";
import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

export function StickyCategoryNav({ categories, primaryColor }: { categories: Category[]; primaryColor: string }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  // Optional: IntersectionObserver to update active category based on scroll
  useEffect(() => {
    const observers = categories.map(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (!el) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setActiveCategory(cat.id);
            }
          });
        },
        { rootMargin: '-10% 0px -80% 0px', threshold: [0.5] }
      );
      
      observer.observe(el);
      return { observer, el };
    });
    
    return () => {
      observers.forEach(obs => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [categories]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <nav className="sticky top-[4.5rem] sm:top-[4rem] z-20 bg-[#f7f7f4]/95 dark:bg-slate-950/95 backdrop-blur-md py-3 px-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-sm">
      <div className="flex gap-2 min-w-max mx-auto max-w-3xl">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
