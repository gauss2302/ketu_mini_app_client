// src/components/menu/menu-item.tsx
import { MenuItem } from "@/data/mock-places";
import { Flame, Leaf } from "lucide-react";

export const MenuItemCard = ({ item }: { item: MenuItem }) => {
  return (
    <div className="flex space-x-3 p-4 bg-white rounded-xl">
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {item.popular && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                  Popular
                </span>
              )}
              {item.spicy && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center">
                  <Flame className="w-3 h-3 mr-1" /> Spicy
                </span>
              )}
              {item.vegetarian && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center">
                  <Leaf className="w-3 h-3 mr-1" /> Veg
                </span>
              )}
            </div>
          </div>
          <span className="font-semibold">${item.price}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
};
