
import { PriceCategory } from "@/components/pricing/PriceCard";

// Function for improving visual appearance of PDFs for PNG export
export const createPdfLayoutForPng = (categories: PriceCategory[]) => {
  // This function creates HTML that will look good in PNG as well
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap');
      
      .pricing-export {
        background-color: white;
        padding: 20px;
        font-family: 'Poppins', sans-serif;
        max-width: 800px;
        margin: 0 auto;
      }
      .pricing-title {
        text-align: center;
        color: #ec4899;
        margin-bottom: 20px;
        font-family: 'Playfair Display', serif;
        font-weight: 700;
      }
      .pricing-category {
        margin-bottom: 20px;
      }
      .pricing-category-title {
        background-color: #ec4899;
        color: white;
        padding: 10px 15px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 4px 4px 0 0;
        font-family: 'Playfair Display', serif;
      }
      .pricing-items {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e5e7eb;
        border-top: none;
        font-family: 'Poppins', sans-serif;
      }
      .pricing-items th {
        background-color: #fdf2f8;
        text-align: left;
        padding: 10px 15px;
        border-bottom: 1px solid #e5e7eb;
        font-weight: bold;
      }
      .pricing-items td {
        padding: 10px 15px;
        border-bottom: 1px solid #e5e7eb;
      }
      .pricing-item-price {
        color: #ec4899;
        font-weight: 500;
        text-align: right;
      }
      .pricing-item-name {
        font-weight: 500;
      }
      .pricing-item-description {
        font-style: italic;
        color: #6b7280;
        font-size: 0.9em;
        padding-top: 0;
      }
      .row-even { background-color: white; }
      .row-odd { background-color: #fdf2f8; }
      .footer {
        margin-top: 20px;
        font-size: 0.8em;
        color: #6b7280;
        text-align: center;
        font-family: 'Poppins', sans-serif;
      }
    </style>
    <div class="pricing-export">
      <h1 class="pricing-title">Cennik Usług</h1>
      ${categories.map(category => `
        <div class="pricing-category">
          <div class="pricing-category-title">${category.title}</div>
          <table class="pricing-items">
            <thead>
              <tr>
                <th>Nazwa zabiegu</th>
                <th style="text-align: right;">Cena</th>
              </tr>
            </thead>
            <tbody>
              ${category.items.map((item, index) => `
                <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                  <td class="pricing-item-name">${item.name}</td>
                  <td class="pricing-item-price">${item.price}</td>
                </tr>
                ${item.description ? `
                  <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                    <td colspan="2" class="pricing-item-description">${item.description}</td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      <div class="footer">
        Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej<br>
        Wygenerowano ${new Date().toLocaleDateString('pl-PL')}
      </div>
    </div>
  `;
};
