import type { MenuItem } from "@/app/modules/places/types/place.types";
import { Flame, Leaf } from "lucide-react";
import Image from "next/image";

const priceFormatter = new Intl.NumberFormat("uz-UZ");

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className={`flex space-x-3 p-4 theme-card rounded-2xl ${item.isAvailable ? "" : "opacity-60"}`}>
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        {item.previewImageUrl ? (
          <Image
            src={item.previewImageUrl}
            alt={item.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="theme-soft-card h-full w-full rounded-xl" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {item.isPopular && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                  Popular
                </span>
              )}
              {item.isSpicy && (
                <span className="flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  <Flame className="w-3 h-3 mr-1" /> Spicy
                </span>
              )}
              {item.isVegetarian && (
                <span className="flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-500/15 dark:text-green-300">
                  <Leaf className="w-3 h-3 mr-1" /> Veg
                </span>
              )}
              {!item.isAvailable && (
                <span className="text-xs px-2 py-0.5 rounded-full theme-chip">
                  Not available
                </span>
              )}
            </div>
          </div>
          <span className="font-semibold">
            {priceFormatter.format(item.price)} {item.currency}
          </span>
        </div>
        <p className="text-sm theme-muted line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
};
