
import { PriceCategory } from "@/components/pricing/PriceCard";

/**
 * Creates HTML layout for PNG exports with proper styling
 * This is used for generating consistent screenshots for PNG exports
 */
export const createPdfLayoutForPng = (categories: PriceCategory[]): string => {
  // Generate the HTML content for the PNG
  return `
    <div style="font-family: 'Playfair Display', 'Poppins', sans-serif; background: white; padding: 30px; color: #333; width: 100%; max-width: 800px;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        h1, h2 { font-family: 'Playfair Display', serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #FDF2F8; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 12px; border-top: 1px solid #FCE7F3; }
        tr:nth-child(even) { background-color: #FCE7F3; }
        .price { font-weight: bold; color: #EC4899; text-align: right; }
        .description { font-style: italic; color: #666; font-size: 0.9em; padding-bottom: 12px; }
        .category-header { background: #EC4899; color: white; padding: 10px 12px; margin-top: 20px; font-size: 18px; }
      </style>
      
      <h1 style="color: #EC4899; text-align: center; margin-bottom: 30px; font-size: 28px;">Cennik Usług</h1>
      
      ${categories.map(category => `
        <div>
          <div class="category-header">${category.title}</div>
          <table>
            <thead>
              <tr>
                <th>Nazwa zabiegu</th>
                <th style="text-align: right;">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${category.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="price">${item.price}</td>
                </tr>
                ${item.description ? `
                <tr>
                  <td colspan="2" class="description">${item.description}</td>
                </tr>` : ''}
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
