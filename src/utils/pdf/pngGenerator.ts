
import { PriceCategory } from "@/components/pricing/PriceCard";

/**
 * Creates HTML layout for PNG exports with proper styling
 * This is used for generating consistent screenshots for PNG exports
 */
export const createPdfLayoutForPng = (categories: PriceCategory[]): string => {
  // Generate the HTML content for the PNG with system fonts
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: white; padding: 30px; color: #333; width: 100%; max-width: 800px;">
      <style>
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
        th { background: #FDF2F8; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 12px; border-top: 1px solid #FCE7F3; word-break: break-word; }
        tr:nth-child(even) { background-color: #FCF2F8; }
        .price { font-weight: bold; color: #EC4899; text-align: right; }
        .description { font-style: italic; color: #666; font-size: 0.9em; padding: 8px 12px; }
        .category-header { background: #EC4899; color: white; padding: 10px 12px; margin-top: 20px; font-size: 18px; }
        .name-col { width: 40%; }
        .desc-col { width: 40%; }
        .price-col { width: 20%; }
      </style>
      
      <h1 style="color: #EC4899; text-align: center; margin-bottom: 30px; font-size: 28px;">Cennik Usług</h1>
      
      ${categories.map(category => `
        <div>
          <div class="category-header">${category.title}</div>
          <table>
            <thead>
              <tr>
                <th class="name-col">Nazwa zabiegu</th>
                <th class="desc-col">Opis</th>
                <th class="price-col" style="text-align: right;">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${category.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.description || ''}</td>
                  <td class="price">${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
        <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
      </div>
    </div>
  `;
};
