import type { MenuCategory } from "@/app/modules/places/types/place.types";
import { MenuItemCard } from "./menu-item";

export const MenuSection = ({ category }: { category: MenuCategory }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 px-4">{category.name}</h2>
      <div className="space-y-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
