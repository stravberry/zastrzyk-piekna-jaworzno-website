
import React from "react";
import ServiceBadge, { BadgeType } from "./ServiceBadge";

export type PriceItem = {
  name: string;
  price: string;
  description?: string;
  badge?: BadgeType;
};

interface PriceCardItemProps {
  item: PriceItem;
  index: number;
}

export const PriceCardItem: React.FC<PriceCardItemProps> = ({ item, index }) => {
  return (
    <>
      <tr className={index % 2 === 0 ? "bg-white" : "bg-pink-50/30"}>
        <td className="py-4 px-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{item.name}</span>
            {item.badge && <ServiceBadge badge={item.badge} size="sm" />}
          </div>
        </td>
        <td className="py-4 px-6 text-right text-pink-600 font-medium">
          {item.price}
        </td>
      </tr>
      {item.description && (
        <tr className={index % 2 === 0 ? "bg-white" : "bg-pink-50/30"}>
          <td colSpan={2} className="py-2 px-6 text-sm text-gray-600 italic border-b border-pink-100/50">
            {item.description}
          </td>
        </tr>
      )}
    </>
  );
};

export type PriceCategory = {
  id: string;
  title: string;
  items: PriceItem[];
};

interface PriceCardProps {
  category: PriceCategory;
}

const PriceCard: React.FC<PriceCardProps> = ({ category }) => {
  return (
    <div id={category.id} className="scroll-mt-32 pt-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 mb-8">
        <div className="bg-pink-500 py-4 px-6">
          <h2 className="text-xl md:text-2xl font-bold text-white font-playfair">
            {category.title}
          </h2>
        </div>

        <div className="p-1">
          <table className="w-full">
            <thead className="bg-pink-50">
              <tr>
                <th className="py-3 px-6 text-left text-gray-700">Nazwa zabiegu</th>
                <th className="py-3 px-6 text-right text-gray-700">Cena</th>
              </tr>
            </thead>
            <tbody>
              {category.items.map((item, index) => (
                <PriceCardItem key={index} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
