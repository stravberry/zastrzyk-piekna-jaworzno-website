
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";

// Add Polish font support to PDF
const addPolishFontSupport = (doc: jsPDF) => {
  // Import fonts explicitly
  import("jspdf").then(async (module) => {
    // This is needed to register fonts properly
    const { jsPDF } = module;
    
    try {
      // Configure Roboto font which has good support for Polish characters
      const fontData = await fetch('/fonts/Roboto-Regular.ttf').catch(() => {
        console.warn("Could not load Roboto font, falling back to built-in fonts");
        return null;
      });
      
      if (fontData) {
        const fontBytes = await fontData.arrayBuffer();
        doc.addFileToVFS('Roboto-Regular.ttf', Buffer.from(fontBytes).toString('base64'));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');
      }
    } catch (error) {
      console.warn("Error setting up custom font, using default:", error);
    }
  });

  // Configure defaults for Polish text
  doc.setLanguage('pl');
  
  // Use standard PDF font with decent Unicode support as fallback
  doc.setFont("helvetica");
  
  return doc;
};

// Generate PDF for pricing data
export const generatePricingPdf = (categories: PriceCategory[]): Blob => {
  const doc = new jsPDF();
  
  // Add support for Polish characters
  addPolishFontSupport(doc);
  
  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Cennik Usług", 14, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  let yPos = 30;
  
  // For each category
  categories.forEach(category => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(category.title, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    yPos += 10;
    
    // Use autoTable for better layout control
    const tableBody = category.items.map(item => [
      item.name,
      item.description || "",
      `${item.price}`
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa", "Opis", "Cena"]],
      body: tableBody,
      theme: "striped",
      headStyles: { 
        fillColor: [236, 72, 153], // Tailwind pink-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243], // Light pink for alternating rows
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        lineWidth: 0.1,
        font: "helvetica",
        halign: 'left',
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153] }
      },
      margin: { top: 10 },
      didParseCell: function(data) {
        // Convert Polish characters to UTF-8 encoding for PDF
        if (typeof data.cell.text === 'string') {
          data.cell.text = data.cell.text
            .replace(/ą/g, '\u0105')
            .replace(/ć/g, '\u0107')
            .replace(/ę/g, '\u0119')
            .replace(/ł/g, '\u0142')
            .replace(/ń/g, '\u0144')
            .replace(/ó/g, '\u00F3')
            .replace(/ś/g, '\u015B')
            .replace(/ź/g, '\u017A')
            .replace(/ż/g, '\u017C')
            .replace(/Ą/g, '\u0104')
            .replace(/Ć/g, '\u0106')
            .replace(/Ę/g, '\u0118')
            .replace(/Ł/g, '\u0141')
            .replace(/Ń/g, '\u0143')
            .replace(/Ó/g, '\u00D3')
            .replace(/Ś/g, '\u015A')
            .replace(/Ź/g, '\u0179')
            .replace(/Ż/g, '\u017B');
        }
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Strona ${i} z ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Return as Blob instead of direct saving
  return doc.output('blob');
};

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

// Function to generate PDF from the pricing data (legacy function kept for compatibility)
export const generatePricingPDF = (title: string, categories: any[]) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add Polish font support
  addPolishFontSupport(doc);
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  
  // Current Y position
  let yPos = 30;
  
  // For each category
  categories.forEach(category => {
    // Add category title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(category.title, 14, yPos);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 10;
    
    // Create table data
    const tableBody = category.items.map((item: any) => [
      item.name,
      item.description || "",
      `${item.price}`
    ]);
    
    // Add table
    autoTable(doc, {
      startY: yPos,
      head: [["Nazwa", "Opis", "Cena"]],
      body: tableBody,
      theme: "striped",
      headStyles: { 
        fillColor: [236, 72, 153],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243],
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        lineWidth: 0.1,
        font: "helvetica",
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153] }
      },
      margin: { top: 10 },
      didParseCell: function(data) {
        // Convert Polish characters to UTF-8 encoding for PDF
        if (typeof data.cell.text === 'string') {
          data.cell.text = data.cell.text
            .replace(/ą/g, '\u0105')
            .replace(/ć/g, '\u0107')
            .replace(/ę/g, '\u0119')
            .replace(/ł/g, '\u0142')
            .replace(/ń/g, '\u0144')
            .replace(/ó/g, '\u00F3')
            .replace(/ś/g, '\u015B')
            .replace(/ź/g, '\u017A')
            .replace(/ż/g, '\u017C')
            .replace(/Ą/g, '\u0104')
            .replace(/Ć/g, '\u0106')
            .replace(/Ę/g, '\u0118')
            .replace(/Ł/g, '\u0141')
            .replace(/Ń/g, '\u0143')
            .replace(/Ó/g, '\u00D3')
            .replace(/Ś/g, '\u015A')
            .replace(/Ź/g, '\u0179')
            .replace(/Ż/g, '\u017B');
        }
      },
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Add new page if necessary
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Strona ${i} z ${pageCount}`,
      doc.internal.pageSize.width - 25,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  doc.save(`cennik-${new Date().toISOString().split("T")[0]}.pdf`);
};
