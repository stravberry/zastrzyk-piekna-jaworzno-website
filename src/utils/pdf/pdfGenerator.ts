
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addPolishFontSupport } from "./fontSupport";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "./pngGenerator";
import { loadGoogleFonts, FONTS, formatPrice } from './canvas/fontUtils';
import { drawRoundedRect, drawCenteredText, drawLeftText, drawRightText, wrapText } from './canvas/drawingUtils';
import { calculateItemHeight } from './canvas/heightCalculator';

// Generate PDF using Canvas API similar to PNG generator for better consistency
export const generatePricingPdf = async (categories: PriceCategory[]): Promise<Blob> => {
  try {
    // Use the SAME font loading as PNG generator
    await loadGoogleFonts();
    // Wait for fonts to load properly - SAME AS PNG
    await new Promise(resolve => setTimeout(resolve, 100));

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm", 
      format: "a4",
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Improved canvas setup - SAME AS PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Use same dimensions as PNG for consistency
    canvas.width = 850;
    canvas.height = 1200; // Taller page for better fitting
    
    // Use imported utilities for consistency with PNG generator

    // Page management
    const maxPageHeight = 1050; // Safe height for content
    const padding = 50;
    const headerHeight = 100;
    const categoryHeaderHeight = 70;
    const spaceBetweenCategories = 30;
    
    let currentPage = 1;
    let currentY = 0;
    
    const startNewPage = () => {
      if (currentPage > 1) {
        // Add current page to PDF
        const imgData = canvas.toDataURL('image/png');
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }
      
      // Clear canvas and reset position
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      currentY = 60; // Same as PNG generator
      currentPage++;
      
      // Draw title using same logic as PNG generator
      ctx.fillStyle = '#EC4899';
      ctx.font = `bold 36px ${FONTS.playfair}, serif`;
      drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY);
      currentY += 80; // Same spacing as PNG generator
    };

    // Start first page
    startNewPage();

    // Process categories like PNG generator
    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const category = categories[categoryIndex];
      
      // Calculate space needed for this category
      let categoryHeight = categoryHeaderHeight + 45; // Header + table header
      category.items.forEach(item => {
        categoryHeight += calculateItemHeight(ctx, item);
      });
      
      // Check if category fits on current page
      if (currentY + categoryHeight > maxPageHeight && currentPage > 1) {
        startNewPage();
      }

      // Draw category header
      ctx.fillStyle = '#EC4899';
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, categoryHeaderHeight, 12);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
      drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 20, canvas.width - padding * 4); // SAME AS PNG
      currentY += categoryHeaderHeight;

      // Table headers
      const nameColumnX = padding + 20;
      const descColumnX = nameColumnX + 250;
      const priceColumnX = canvas.width - padding - 20;
      const tableHeaderHeight = 45;

      ctx.fillStyle = '#FDF2F8';
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, tableHeaderHeight, 8);
      
      ctx.fillStyle = '#333333';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Nazwa zabiegu', nameColumnX, currentY + tableHeaderHeight / 2);
      ctx.fillText('Opis', descColumnX, currentY + tableHeaderHeight / 2);
      ctx.textAlign = 'right';
      ctx.fillText('Cena', priceColumnX, currentY + tableHeaderHeight / 2);
      currentY += tableHeaderHeight;

      // Draw items
      for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
        const item = category.items[itemIndex];
        const itemHeight = calculateItemHeight(ctx, item);
        
        // Check if item fits on page
        if (currentY + itemHeight > maxPageHeight) {
          startNewPage();
          
          // Redraw category header on new page
          ctx.fillStyle = '#EC4899';
          drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, categoryHeaderHeight, 12);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
          drawCenteredText(ctx, `${category.title} (cd.)`, canvas.width / 2, currentY + 20, canvas.width - padding * 4); // SAME AS PNG
          currentY += categoryHeaderHeight;

          // Redraw table headers
          ctx.fillStyle = '#FDF2F8';
          drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, tableHeaderHeight, 8);
          
          ctx.fillStyle = '#333333';
          ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('Nazwa zabiegu', nameColumnX, currentY + tableHeaderHeight / 2);
          ctx.fillText('Opis', descColumnX, currentY + tableHeaderHeight / 2);
          ctx.textAlign = 'right';
          ctx.fillText('Cena', priceColumnX, currentY + tableHeaderHeight / 2);
          currentY += tableHeaderHeight;
        }

        const isEven = itemIndex % 2 === 0;
        
        // Row background
        ctx.fillStyle = isEven ? '#FCF2F8' : '#F8F9FA';
        drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 6);

        // Service name
        const hasDescription = item.description && item.description.trim() !== '';
        const nameStartY = hasDescription ? currentY + 25 : currentY + 15;
        
        ctx.fillStyle = '#1F2937';
        ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
        drawLeftText(ctx, item.name, nameColumnX, nameStartY, 240);

        // Description
        if (hasDescription) {
          const nameLines = wrapText(ctx, item.name || '', 240);
          const nameEndY = currentY + 25 + (nameLines.length * 22) + 15;
          
          ctx.fillStyle = '#4B5563';
          ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
          drawLeftText(ctx, item.description, descColumnX, nameEndY, 200);
        }

        // Price
        ctx.fillStyle = '#EC4899';
        ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
        drawRightText(ctx, formatPrice(item.price), priceColumnX, currentY + itemHeight / 2);

        currentY += itemHeight;
      }

      // Add space between categories
      if (categoryIndex < categories.length - 1) {
        currentY += spaceBetweenCategories;
      }
    }

    // Footer
    currentY += 40;
    ctx.fillStyle = '#666666';
    ctx.font = `400 12px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, 'Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
    currentY += 20;
    drawCenteredText(ctx, `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`, canvas.width / 2, currentY);

    // Add final page to PDF
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Improved HTML-to-PDF generator with reduced margins and better row spacing
export const generatePricingPdfFromHtml = async (categories: PriceCategory[]): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Format price with proper Polish currency symbol
      const formatPrice = (price: string): string => {
        if (price.toLowerCase().includes('zł')) {
          return price;
        }
        return price.trim() + ' zł';
      };
      
      // Function to split large categories for better page breaks
      const splitLargeCategory = (category: PriceCategory, maxItemsPerSection: number = 12): PriceCategory[] => {
        if (category.items.length <= maxItemsPerSection) {
          return [category];
        }
        
        const sections = [];
        for (let i = 0; i < category.items.length; i += maxItemsPerSection) {
          sections.push({
            ...category,
            title: i === 0 ? category.title : `${category.title} (cd.)`,
            items: category.items.slice(i, i + maxItemsPerSection)
          });
        }
        return sections;
      };
      
      // Split large categories to prevent page break issues
      const processedCategories = categories.flatMap(category => 
        splitLargeCategory(category, 10)
      );
      
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Generate HTML content with Google Fonts and improved styling
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
          <style>
            @charset "UTF-8";
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
            
            @page { 
              size: A4; 
              margin: 20mm 18mm; 
            }
            
            body { 
              margin: 0; 
              padding: 18px; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              line-height: 1.8;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            * { 
              box-sizing: border-box; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important;
              text-rendering: optimizeLegibility;
            }
            
            .page { 
              width: 100%; 
              padding: 0; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
            }
            
            .title { 
              color: #EC4899; 
              text-align: center; 
              margin-bottom: 35px; 
              font-size: 36px; /* Increased from 32px for better prominence */
              font-weight: 700; 
              font-family: 'Playfair Display', serif !important; 
              page-break-after: avoid;
              line-height: 1.2;
              letter-spacing: 0.5px;
              padding: 0 20px; /* Add padding to prevent text cutoff */
              word-wrap: break-word; /* Ensure text wraps if needed */
              white-space: nowrap; /* Keep title on single line */
              overflow: visible; /* Ensure text is visible */
            }
            
            .category { 
              page-break-inside: avoid; 
              break-inside: avoid;
              margin-bottom: 25px; 
              min-height: 100px;
            }
            
            .category:not(:first-child) { 
              margin-top: 30px; 
            }
            
            .category-header { 
              background: #EC4899; 
              color: white; 
              padding: 16px 18px; 
              margin: 0; 
              font-size: 22px; /* Slightly increased from 20px */
              font-family: 'Playfair Display', serif !important; 
              font-weight: 600;
              page-break-after: avoid;
              break-after: avoid;
              border-radius: 8px 8px 0 0;
              text-align: center;
              line-height: 1.3;
              letter-spacing: 0.3px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 50px;
              word-wrap: break-word; /* Ensure text wraps if needed */
              overflow: visible; /* Ensure text is visible */
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; /* Reduced bottom margin */
              table-layout: fixed; 
              page-break-inside: avoid;
              break-inside: avoid;
              border-radius: 0 0 8px 8px;
              overflow: hidden;
            }
            th { 
              background: #FDF2F8; 
              padding: 16px 18px; 
              text-align: left; 
              font-weight: 600; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              border-bottom: 2px solid #F3E8FF;
              font-size: 14px;
              line-height: 1.4;
              vertical-align: middle;
            }
            
            td { 
              padding: 18px; 
              border-top: 1px solid #FCE7F3; 
              word-break: break-word; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
              break-inside: avoid;
              font-size: 13px;
              line-height: 1.6; 
              vertical-align: middle;
            }
            
            tr { 
              page-break-inside: avoid;
              break-inside: avoid;
              min-height: 50px; 
            }
            
            tr:nth-child(even) { 
              background-color: #FDFAFC; 
            }
            
            .price { 
              font-weight: 600; 
              color: #EC4899; 
              text-align: right; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              font-size: 14px;
            }
            
            .description { 
              font-style: italic; 
              color: #666; 
              font-size: 12px; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              padding-top: 10px; 
              line-height: 1.5;
            }
            
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #666; 
              font-size: 12px; 
              font-family: 'Poppins', Arial, Helvetica, sans-serif !important; 
              page-break-inside: avoid;
              padding-top: 18px; 
              border-top: 1px solid #E5E7EB;
            }
            
            /* Enhanced print-specific styles with reduced margins */
            @media print {
              body { padding: 0; }
              .category { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
                margin-bottom: 20px !important;
              }
              .category-header { 
                page-break-after: avoid !important; 
                break-after: avoid !important;
              }
              table { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
              }
              tr { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
                min-height: 48px !important; /* Better row spacing for print */
              }
              td { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important;
                padding: 16px !important; /* Increased padding for print */
              }
              thead { 
                display: table-header-group !important; 
              }
              .category:nth-child(n+3) {
                page-break-before: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <h1 class="title">Cennik Usług</h1>
            
            ${processedCategories.map((category, index) => `
              <div class="category" style="${index > 0 && index % 2 === 0 ? 'page-break-before: auto;' : ''}">
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
                        <td class="description">${item.description || ''}</td>
                        <td class="price">${formatPrice(item.price)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
            
            <div class="footer">
              <p><strong>Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej</strong></p>
              <p>Wygenerowano ${new Date().toLocaleDateString('pl-PL')}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Preload fonts before rendering
      const preloadFonts = async (): Promise<void> => {
        try {
          console.log('Ładowanie fontów dla PDF...');
          
          // Load Playfair Display font
          await document.fonts.load('700 32px "Playfair Display"');
          await document.fonts.load('600 20px "Playfair Display"');
          
          // Load Poppins font
          await document.fonts.load('600 14px "Poppins"');
          await document.fonts.load('400 13px "Poppins"');
          
          console.log('Fonty zostały załadowane dla PDF');
        } catch (error) {
          console.error('Błąd podczas ładowania fontów dla PDF:', error);
        }
      };
      
      // Preload fonts before rendering
      await preloadFonts();
      
      // Wait for complete rendering with fonts
      await new Promise(r => setTimeout(r, 4000));
      
      // Create PDF using the improved method with reduced margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Split content into logical sections for better page handling
      const categoryElements = tempContainer.querySelectorAll('.category');
      const maxPageHeight = 240; // mm, increased for smaller margins
      const pageMargin = 18; // mm reduced margin from edges
      
      let currentPageHeight = 40; // Start after title with reduced margin
      let isFirstPage = true;
      
      // Render title first with margin
      const titleCanvas = await html2canvas(tempContainer.querySelector('.title'), {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
      });
      
      const titleImgData = titleCanvas.toDataURL('image/png', 1.0);
      const titleHeight = (titleCanvas.height * 170) / titleCanvas.width; // Scale to fit with reduced margins
      
      pdf.addImage(titleImgData, 'PNG', pageMargin, pageMargin, 170, titleHeight);
      currentPageHeight += titleHeight + 20;
      
      // Process each category with reduced margins
      for (let i = 0; i < categoryElements.length; i++) {
        const categoryElement = categoryElements[i] as HTMLElement;
        
        // Render category to canvas
        const categoryCanvas = await html2canvas(categoryElement, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
        });
        
        const categoryImgData = categoryCanvas.toDataURL('image/png', 1.0);
        const categoryHeight = (categoryCanvas.height * 170) / categoryCanvas.width;
        
        // Check if category fits on current page with reduced margins
        if (currentPageHeight + categoryHeight > maxPageHeight && !isFirstPage) {
          pdf.addPage();
          currentPageHeight = pageMargin;
        }
        
        // Add category to PDF with reduced margins
        pdf.addImage(categoryImgData, 'PNG', pageMargin, currentPageHeight, 170, categoryHeight);
        currentPageHeight += categoryHeight + 10;
        isFirstPage = false;
      }
      
      // Add footer to all pages with reduced margins
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const pageCount = pdf.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Strona ${i} z ${pageCount}`, 210 - pageMargin, 297 - 15, { align: 'right' });
      }
      
      // Clean up and resolve
      document.body.removeChild(tempContainer);
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
      
    } catch (error) {
      console.error("Error in HTML to PDF conversion process:", error);
      reject(error);
    }
  });
};

// Legacy function kept for backward compatibility
export const generatePricingPDF = async (title: string, categories: any[]) => {
  try {
    const pdfBlob = await generatePricingPdfFromHtml(categories);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `cennik-${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error("Error generating legacy PDF:", error);
    throw error;
  }
};
