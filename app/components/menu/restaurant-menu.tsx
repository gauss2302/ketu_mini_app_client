// src/components/menu/restaurant-menu.tsx
import { useState } from "react";
import { MenuCategory } from "@/data/mock-places";
import { MenuSection } from "./menu-section";

interface RestaurantMenuProps {
  categories: MenuCategory[];
}

export const RestaurantMenu = ({ categories }: RestaurantMenuProps) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  return (
    <div className="bg-gray-50 -mx-4">
      {/* Category Navigation */}
      <div className="sticky top-0 bg-white border-b z-10">
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
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Sections */}
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
