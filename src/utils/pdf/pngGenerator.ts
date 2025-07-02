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

  // Format badge for display
  const formatBadge = (badge?: string): string => {
    if (!badge) return '';
    
    const badgeConfig = {
      promotion: { text: 'PROMOCJA', color: '#EC4899' },
      new: { text: 'NOWOŚĆ', color: '#10B981' }
    };
    
    const config = badgeConfig[badge as keyof typeof badgeConfig];
    if (!config) return '';
    
    return `<span style="display: inline-block; background: ${config.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-left: 8px;">${config.text}</span>`;
  };

  // Generate the HTML content for the PNG with proper fonts and improved styling
  return `
    <div style="font-family: 'Playfair Display', 'Poppins', serif; background: white; padding: 30px; color: #333; width: 100%; max-width: 800px; text-align: left; box-sizing: border-box;">
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        @charset "UTF-8";
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
        
        * { 
          font-family: 'Poppins', Arial, Helvetica, sans-serif; 
          box-sizing: border-box;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
          table-layout: fixed; 
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        th { 
          background: #FDF2F8; 
          padding: 12px; 
          text-align: left; 
          font-weight: 600; 
          font-size: 16px;
          line-height: 1.4;
          vertical-align: middle;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        td { 
          padding: 12px; 
          border-top: 1px solid #FCE7F3; 
          word-break: break-word; 
          font-size: 14px;
          line-height: 1.5;
          vertical-align: middle;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        tr:nth-child(even) { background-color: #FCF2F8; }
        
        .price { 
          font-weight: 600; 
          color: #EC4899; 
          text-align: right;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .description { 
          font-style: italic; 
          color: #666; 
          font-size: 0.9em; 
          padding: 8px 12px;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .category-header { 
          background: #EC4899; 
          color: white; 
          padding: 12px 16px; 
          margin-top: 20px; 
          font-size: 20px; 
          text-align: center;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          line-height: 1.3;
          font-family: 'Playfair Display', serif;
        }
        
        .title { 
          color: #EC4899; 
          text-align: center; 
          margin-bottom: 30px; 
          font-size: 28px; 
          font-weight: 700;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
        }
        
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          color: #666; 
          font-size: 12px;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .service-name { 
          display: flex; 
          align-items: center; 
          flex-wrap: wrap; 
          gap: 8px;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
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
                  <td>
                    <div class="service-name">
                      ${item.name}${formatBadge(item.badge)}
                    </div>
                  </td>
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

/**
 * Creates HTML layout for single category PNG export in 9:16 format
 */
export const createSingleCategoryLayoutForPng = (category: PriceCategory): string => {
  // Format price for proper display with Polish currency symbol
  const formatPrice = (price: string): string => {
    if (price.toLowerCase().includes('zł')) {
      return price;
    }
    return price.trim() + ' zł';
  };

  // Format badge for display
  const formatBadge = (badge?: string): string => {
    if (!badge) return '';
    
    const badgeConfig = {
      promotion: { text: 'PROMOCJA', color: '#EC4899' },
      new: { text: 'NOWOŚĆ', color: '#10B981' }
    };
    
    const config = badgeConfig[badge as keyof typeof badgeConfig];
    if (!config) return '';
    
    return `<div style="display: inline-block; background: ${config.color}; color: white; padding: 2px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; margin-top: 2px;">${config.text}</div>`;
  };

  return `
    <div style="font-family: 'Playfair Display', 'Poppins', serif; background: white; padding: 20px; color: #333; width: 450px; height: 800px; display: flex; flex-direction: column; box-sizing: border-box;">
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        @charset "UTF-8";
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
        
        * { 
          font-family: 'Poppins', Arial, Helvetica, sans-serif; 
          box-sizing: border-box;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .container { 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
        }
        
        .title { 
          color: #EC4899; 
          font-size: 20px; 
          font-weight: 700; 
          margin: 0 0 10px 0;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
        }
        
        .category-title { 
          background: #EC4899; 
          color: white; 
          padding: 10px 12px; 
          font-size: 18px; 
          font-weight: 600; 
          text-align: center; 
          margin-bottom: 15px; 
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 45px;
          line-height: 1.3;
          font-family: 'Playfair Display', serif;
        }
        
        .content { 
          flex: 1; 
          overflow: hidden; 
        }
        
        .item { 
          padding: 12px; 
          border-bottom: 1px solid #FCE7F3;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .item:nth-child(even) { 
          background-color: #FCF2F8; 
        }
        
        .item-name { 
          font-weight: 600; 
          color: #333; 
          font-size: 14px; 
          margin-bottom: 4px;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .item-price { 
          color: #EC4899; 
          font-weight: 600; 
          font-size: 14px; 
          margin-bottom: 4px;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .item-description { 
          color: #666; 
          font-size: 12px; 
          font-style: italic; 
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .footer { 
          text-align: center; 
          color: #666; 
          font-size: 10px; 
          margin-top: 15px; 
          padding-top: 15px; 
          border-top: 1px solid #FCE7F3;
          line-height: 1.4;
          font-family: 'Poppins', Arial, Helvetica, sans-serif;
        }
        
        .item-header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          flex-wrap: wrap; 
          gap: 4px;
          line-height: 1.4;
        }
      </style>
      
      <div class="container">
        <div class="header">
          <div class="title">Zastrzyk Piękna</div>
        </div>
        
        <div class="category-title">${category.title}</div>
        
        <div class="content">
          ${category.items.map(item => `
            <div class="item">
              <div class="item-header">
                <div class="item-name">${item.name}</div>
                ${formatBadge(item.badge)}
              </div>
              <div class="item-price">${formatPrice(item.price)}</div>
              ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p>Gabinet Kosmetologii Estetycznej</p>
          <p>${new Date().toLocaleDateString('pl-PL')}</p>
        </div>
      </div>
    </div>
  `;
};
