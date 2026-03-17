"use client";

import { useEffect, useState } from "react";
import type { MenuCategory } from "@/app/modules/places/types/place.types";
import { MenuSection } from "./menu-section";

interface RestaurantMenuProps {
  categories: MenuCategory[];
}

export const RestaurantMenu = ({ categories }: RestaurantMenuProps) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  useEffect(() => {
    setActiveCategory(categories[0]?.id);
  }, [categories]);

  if (categories.length === 0) {
    return (
      <div className="theme-card -mx-4 rounded-[28px] px-4 py-6 text-sm theme-muted">
        Menu is not available for this place yet.
      </div>
    );
  }

  return (
    <div className="-mx-4">
      <div
        className="sticky top-0 z-10 border-b theme-divider backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), transparent), var(--app-surface-elevated)",
        }}
      >
        <div className="overflow-x-auto">
          <div className="flex px-4 py-3 space-x-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  document
                    .getElementById(category.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-[#FF7352] text-white"
                    : "theme-chip"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        {categories.map((category) => (
          <div key={category.id} id={category.id}>
            <MenuSection category={category} />
          </div>
        ))}
      </div>
    </div>
  );
};
