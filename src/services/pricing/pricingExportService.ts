
import { PriceCategory } from "@/components/pricing/PriceCard";
import { getPriceCategories } from "./pricingCoreService";
import html2canvas from "html2canvas";

// Export pricing data as PDF
export const exportPricingToPdf = async (categoryId?: string): Promise<Blob> => {
  // This function will be implemented with a PDF generation library
  const categories = await getPriceCategories();
  
  // If categoryId is provided, filter to that category only
  const filteredCategories = categoryId 
    ? categories.filter(cat => cat.id === categoryId) 
    : categories;
  
  // We'll implement the actual PDF generation in a separate module
  const { generatePricingPdf } = await import('@/utils/pdfGenerator');
  return generatePricingPdf(filteredCategories);
};

// Export pricing data as PNG
export const exportPricingToPng = async (categoryId?: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Wait for next render cycle to ensure DOM is updated
      setTimeout(async () => {
        // Get the categories to render
        const categories = await getPriceCategories();
        
        // Filter categories if categoryId is provided
        const targetCategories = categoryId
          ? categories.filter(cat => cat.id === categoryId)
          : categories;
        
        if (targetCategories.length === 0) {
          throw new Error("No pricing categories found to export");
        }
        
        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px'; // Fixed width for consistent output
        document.body.appendChild(tempContainer);
        
        // Apply necessary styles
        tempContainer.innerHTML = `
          <style>
            .pricing-export {
              background-color: white;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .pricing-category {
              margin-bottom: 20px;
            }
            .pricing-category-title {
              background-color: #ec4899;
              color: white;
              padding: 10px;
              font-size: 18px;
              font-weight: bold;
            }
            .pricing-items {
              width: 100%;
              border-collapse: collapse;
            }
            .pricing-items th {
              background-color: #fdf2f8;
              text-align: left;
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .pricing-items td {
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .pricing-item-price {
              color: #ec4899;
              font-weight: 500;
              text-align: right;
            }
            .pricing-item-description {
              font-style: italic;
              color: #6b7280;
              font-size: 0.9em;
            }
            .row-even { background-color: white; }
            .row-odd { background-color: #fdf2f8; }
          </style>
          <div class="pricing-export">
            <h1 style="text-align: center; color: #ec4899; margin-bottom: 20px;">
              Cennik Usług
            </h1>
            ${targetCategories.map(category => `
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
                        <td>${item.name}</td>
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
          </div>
        `;
        
        // Use html2canvas to convert to image
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // Higher resolution
          backgroundColor: '#ffffff',
          logging: false
        });
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Clean up temporary element
            document.body.removeChild(tempContainer);
            resolve(blob);
          } else {
            reject(new Error("Failed to create image"));
          }
        }, 'image/png');
      }, 100);
    } catch (error) {
      console.error("Error generating PNG:", error);
      reject(error);
    }
  });
};
