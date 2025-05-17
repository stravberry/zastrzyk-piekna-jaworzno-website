
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addPolishFontSupport } from "./fontSupport";
import html2canvas from "html2canvas";
import { createPdfLayoutForPng } from "./pngGenerator";

// Generate PDF for pricing data using jsPDF and autoTable
export const generatePricingPdf = async (categories: PriceCategory[]): Promise<Blob> => {
  try {
    // Próba zastosowania techniki dzielenia dokumentu na mniejsze części
    // jeśli jest zbyt dużo kategorii
    if (categories.length > 3) {
      // Generuj PDF tylko dla pierwszej kategorii jako fallback
      const singleCategoryDoc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      });
      
      // Add support for Polish characters
      await addPolishFontSupport(singleCategoryDoc);
      
      // Main title page
      singleCategoryDoc.setFontSize(24);
      singleCategoryDoc.setTextColor(236, 72, 153); // Pink color for title
      singleCategoryDoc.text("Cennik Usług", singleCategoryDoc.internal.pageSize.width / 2, 20, { align: "center" });
      
      // Wyświetl tylko pierwszą kategorię
      const category = categories[0];
      let yPosition = 40;
      
      // Category header with background
      singleCategoryDoc.setFillColor(236, 72, 153); // Pink background
      singleCategoryDoc.rect(10, yPosition - 5, singleCategoryDoc.internal.pageSize.width - 20, 10, "F");
      
      // Category title text
      singleCategoryDoc.setFontSize(14);
      singleCategoryDoc.setTextColor(255, 255, 255); // White text
      singleCategoryDoc.text(category.title, 15, yPosition);
      
      yPosition += 10;
      
      // Create table for items (z ograniczoną liczbą wierszy)
      const limitedItems = category.items.slice(0, 10); // Ogranicz do 10 pierwszych pozycji
      
      autoTable(singleCategoryDoc, {
        startY: yPosition,
        head: [["Nazwa zabiegu", "Opis", "Cena"]],
        body: limitedItems.map(item => [
          item.name,
          item.description || "",
          item.price
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [253, 242, 248], // Light pink
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 12,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30, halign: 'right', textColor: [236, 72, 153], fontStyle: 'bold' }
        },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 6,
          overflow: 'linebreak',
        },
        tableWidth: 'auto',
        margin: { left: 10, right: 10 },
        rowPageBreak: 'avoid',
        bodyStyles: { minCellHeight: 20 },
        didDrawPage: (data) => {
          // Add page number
          singleCategoryDoc.setFontSize(10);
          singleCategoryDoc.setTextColor(100);
          singleCategoryDoc.text(
            `Wygenerowano częściowy podgląd cennika`,
            singleCategoryDoc.internal.pageSize.width / 2,
            singleCategoryDoc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });
      
      // Informacja o ograniczeniu
      singleCategoryDoc.setFontSize(12);
      singleCategoryDoc.setTextColor(236, 72, 153);
      singleCategoryDoc.text(
        "Ze względu na dużą ilość danych wygenerowano tylko podgląd pierwszej kategorii.",
        singleCategoryDoc.internal.pageSize.width / 2,
        singleCategoryDoc.internal.pageSize.height - 20,
        { align: "center", maxWidth: singleCategoryDoc.internal.pageSize.width - 30 }
      );
      
      // Return as blob
      return singleCategoryDoc.output('blob');
    }
    
    // Standardowe generowanie dla małej liczby kategorii
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
    });
    
    // Add support for Polish characters
    await addPolishFontSupport(doc);
    
    // Main title page
    doc.setFontSize(24);
    doc.setTextColor(236, 72, 153); // Pink color for title
    doc.text("Cennik Usług", doc.internal.pageSize.width / 2, 20, { align: "center" });
    
    // Process each category on a separate page
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Always add new page for each category after the first page
      if (i > 0) {
        doc.addPage();
      }
      
      // Reset position for new page
      let yPosition = 40; // Start slightly lower on category pages
      
      // Category header with background
      doc.setFillColor(236, 72, 153); // Pink background
      doc.rect(10, yPosition - 5, doc.internal.pageSize.width - 20, 10, "F");
      
      // Category title text
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // White text
      doc.text(category.title, 15, yPosition);
      
      yPosition += 10;
      
      // Create table for items
      autoTable(doc, {
        startY: yPosition,
        head: [["Nazwa zabiegu", "Opis", "Cena"]],
        body: category.items.map(item => [
          item.name,
          item.description || "",
          item.price
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [253, 242, 248], // Light pink
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 12,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30, halign: 'right', textColor: [236, 72, 153], fontStyle: 'bold' }
        },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 6,
          overflow: 'linebreak',
        },
        tableWidth: 'auto',
        margin: { left: 10, right: 10 },
        // Keep table rows together on same page when possible
        rowPageBreak: 'avoid',
        // Avoid breaking inside rows (important for descriptions)
        bodyStyles: { minCellHeight: 20 },
        didDrawPage: (data) => {
          // Add page number
          doc.setFontSize(10);
          doc.setTextColor(100);
          const pageCount = doc.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
              `Strona ${i} z ${pageCount}`,
              doc.internal.pageSize.width - 20,
              doc.internal.pageSize.height - 10
            );
            
            // Add footer to every page
            const footerText = "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej";
            const dateText = `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`;
            doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: "center" });
            doc.text(dateText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: "center" });
          }
        },
      });
    }
    
    // Return as blob
    return doc.output('blob');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Improved HTML-to-PDF generator with better page breaking
export const generatePricingPdfFromHtml = async (categories: PriceCategory[]): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Limit na zbyt dużą ilość danych aby uniknąć błędu 'Invalid string length'
      if (categories.length > 3) {
        // Jeśli za dużo kategorii, ogranicz do pierwszej
        const limitedCategories = [categories[0]];
        console.log("Ograniczono generowanie PDF tylko do pierwszej kategorii:", limitedCategories[0].title);
        
        // Wywołanie ponownie tej samej funkcji, ale z ograniczonymi danymi
        const pdfBlob = await generatePricingPdfFromHtml(limitedCategories);
        resolve(pdfBlob);
        return;
      }
      
      // Format price with proper Polish currency symbol
      const formatPrice = (price: string): string => {
        // Keep original formatting if it already contains "zł" 
        if (price.toLowerCase().includes('zł')) {
          return price;
        }
        // Otherwise add "zł" with proper spacing
        return price.trim() + ' zł';
      };
      
      // Create HTML container in a hidden area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);
      
      // Generate HTML content - uprościmy strukturę dla mniejszego rozmiaru
      tempContainer.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @charset "UTF-8";
            @page { size: A4; margin: 20mm 15mm; }
            body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif !important; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            /* Uproszczone style dla kompaktowego PDF */
            .title { color: #EC4899; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .category-header { background: #EC4899; color: white; padding: 8px 10px; margin-top: 15px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #FDF2F8; padding: 8px; text-align: left; font-weight: bold; font-size: 14px; }
            td { padding: 6px; border-top: 1px solid #FCE7F3; font-size: 12px; }
            tr:nth-child(even) { background-color: #FCF2F8; }
            .price { font-weight: bold; color: #EC4899; text-align: right; }
            .footer { text-align: center; margin-top: 15px; color: #666; font-size: 10px; }
            
            /* Page break rules */
            .page-container { page-break-after: always; position: relative; padding: 20px 10px 40px 10px; }
            .page-container:last-child { page-break-after: auto; }
          </style>
        </head>
        <body>
          <!-- Title page -->
          <div class="page-container">
            <h1 class="title">Cennik Usług</h1>
            <p style="text-align: center; font-size: 14px; color: #666;">Zastrzyk Piękna</p>
          </div>
          
          <!-- Each category on its own page -->
          ${categories.map(category => `
            <div class="page-container">
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
                      <td style="font-size:11px; color:#666; font-style:italic;">${item.description || ''}</td>
                      <td class="price">${formatPrice(item.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="footer">
                <p>Zastrzyk Piękna - ${new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      // Wait for fonts and rendering to complete
      await new Promise(r => setTimeout(r, 500)); // Zredukowany czas oczekiwania
      
      // Use html2canvas with minimal settings to avoid memory issues
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Reduced scale to avoid memory issues
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        onclone: (document, element) => {
          // Force Arial font everywhere
          const style = document.createElement('style');
          style.textContent = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
          document.head.appendChild(style);
          return element;
        }
      });
      
      // Create PDF with minimum memory usage
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true, // Kompresja dla zmniejszenia rozmiaru
      });
      
      // Dodaj pierwszą stronę tytułową
      pdf.setFontSize(24);
      pdf.setTextColor(236, 72, 153); // Pink color
      pdf.text("Cennik Usług", pdf.internal.pageSize.width / 2, 30, { align: "center" });
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Zastrzyk Piękna", pdf.internal.pageSize.width / 2, 45, { align: "center" });
      
      // Dodaj strony dla każdej kategorii
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        pdf.addPage();
        
        // Nagłówek kategorii
        pdf.setFillColor(236, 72, 153); // Pink background
        pdf.rect(10, 20, pdf.internal.pageSize.width - 20, 10, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255); // White text
        pdf.text(category.title, 15, 27);
        
        // Tabela z pozycjami
        autoTable(pdf, {
          startY: 35,
          head: [["Nazwa zabiegu", "Opis", "Cena"]],
          body: category.items.map(item => [
            item.name,
            item.description || "",
            formatPrice(item.price)
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [253, 242, 248], 
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 65 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'right', textColor: [236, 72, 153] }
          },
          styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 4,
          },
          margin: { left: 10, right: 10 },
        });
        
        // Stopka
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Zastrzyk Piękna - ${new Date().toLocaleDateString('pl-PL')}`,
          pdf.internal.pageSize.width / 2,
          pdf.internal.pageSize.height - 10,
          { align: "center" }
        );
      }
      
      // Clean up the temporary DOM elements
      document.body.removeChild(tempContainer);
      
      // Return PDF as blob
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
