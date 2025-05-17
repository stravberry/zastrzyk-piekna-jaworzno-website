import { PriceCategory } from "@/components/pricing/PriceCard";

/**
 * Creates HTML layout for PNG exports with proper styling and character encoding
 * This is used for generating consistent screenshots for PNG exports
 */
export const createPdfLayoutForPng = (categories: PriceCategory[]): string => {
  // Format price for proper display with Polish currency symbol
  const formatPrice = (price: string): string => {
    // Keep original formatting if it already contains "zł" 
    if (price.toLowerCase().includes('zł')) {
      return price;
    }
    // Otherwise add "zł" with proper spacing
    return price.trim() + ' zł';
  };

  // Generate the HTML content for the PNG with explicit character encoding
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: white; padding: 30px; color: #333; width: 100%; max-width: 800px; text-align: left;">
      <meta charset="UTF-8">
      <style>
        @charset "UTF-8";
        * { font-family: Arial, Helvetica, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
        th { background: #FDF2F8; padding: 12px; text-align: left; font-weight: bold; font-size: 16px; }
        td { padding: 12px; border-top: 1px solid #FCE7F3; word-break: break-word; font-size: 14px; }
        tr:nth-child(even) { background-color: #FCF2F8; }
        .price { font-weight: bold; color: #EC4899; text-align: right; }
        .description { font-style: italic; color: #666; font-size: 0.9em; padding: 8px 12px; }
        .category-header { background: #EC4899; color: white; padding: 10px 12px; margin-top: 20px; font-size: 20px; }
        .title { color: #EC4899; text-align: center; margin-bottom: 30px; font-size: 28px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
      
      <h1 class="title">Cennik Usług</h1>
      
      ${categories.map(category => `
        <div>
          <div class="category-header">${category.title}</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%">Nazwa zabiegu</th>
                <th style="width: 40%">Opis</th>
                <th style="width: 20%; text-align: right;">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${category.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.description || ''}</td>
                  <td class="price">${formatPrice(item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      
      <div class="footer">
        <p>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</p>
        <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
      </div>
    </div>
  `;
};
