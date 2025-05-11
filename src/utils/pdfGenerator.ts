
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PriceCategory } from "@/components/pricing/PriceCard";

// Funkcja do generowania PDF dla danych cennika
export const generatePricingPDF = (title: string, categories: any[]) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Dodaj font - podstawowy jest już wbudowany, więc nie musimy go osobno ładować
  doc.setFont("helvetica", "normal");
  
  // Dodaj tytuł
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  
  // Current Y position
  let yPos = 30;
  
  // For each category
  categories.forEach(category => {
    // Dodaj tytuł kategorii
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
        fillColor: [236, 72, 153], // róż zgodny z Tailwind pink-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243], // jasnoróżowy dla co drugiego wiersza
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153] }
      },
      margin: { top: 10 },
    });
    
    // Update yPos based on where the table ends
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Dodaj nową stronę, jeśli to konieczne
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

// Funkcja dla usługi cennika
export const generatePricingPdf = (categories: PriceCategory[]): Blob => {
  const doc = new jsPDF();
  
  // Dodaj font - podstawowy jest już wbudowany
  doc.setFont("helvetica", "normal");
  
  // Dodaj tytuł
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Cennik Usług", 14, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  let yPos = 30;
  
  // Dla każdej kategorii
  categories.forEach(category => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(category.title, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    yPos += 10;
    
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
        fillColor: [236, 72, 153], // róż zgodny z Tailwind pink-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [252, 231, 243], // jasnoróżowy dla co drugiego wiersza
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', fontStyle: 'bold', textColor: [236, 72, 153] }
      },
      margin: { top: 10 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Dodaj stopkę
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
  
  // Zwróć jako Blob zamiast bezpośredniego zapisywania
  return doc.output('blob');
};

// Funkcja do poprawienia graficznego wyglądu PDFów dla eksportu PNG
export const createPdfLayoutForPng = (categories: PriceCategory[]) => {
  // Ta funkcja tworzy HTML, który będzie ładnie wyglądał również w PDF
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      
      .pricing-export {
        background-color: white;
        padding: 20px;
        font-family: Arial, sans-serif;
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
