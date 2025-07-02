import { PriceCategory } from "@/components/pricing/PriceCard";

// Font configuration
const FONTS = {
  playfair: 'Playfair Display',
  poppins: 'Poppins'
};

// Load Google Fonts using FontFace API
const loadGoogleFonts = async (): Promise<void> => {
  try {
    // Load Playfair Display
    const playfairFont = new FontFace(FONTS.playfair, 'url(https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap)');
    await playfairFont.load();
    document.fonts.add(playfairFont);

    // Load Poppins
    const poppinsFont = new FontFace(FONTS.poppins, 'url(https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap)');
    await poppinsFont.load();
    document.fonts.add(poppinsFont);

    console.log('Google Fonts loaded successfully');
  } catch (error) {
    console.warn('Failed to load Google Fonts, using system fonts:', error);
  }
};

// Format price with Polish currency
const formatPrice = (price: string): string => {
  if (price.toLowerCase().includes('zł')) {
    return price;
  }
  return price.trim() + ' zł';
};

// Draw rounded rectangle
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 8
): void => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// Enhanced text wrapping with better word handling
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  if (!text || text.trim() === '') return [''];
  
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
};

// Enhanced centered text with proper multiline handling
const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (maxWidth && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 22;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  } else {
    ctx.fillText(text, x, y);
  }
};

// Enhanced left-aligned text with better line spacing
const drawLeftText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  if (maxWidth && text && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 20;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight));
    });
  } else if (text) {
    ctx.fillText(text, x, y);
  }
};

// Enhanced right-aligned text
const drawRightText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  if (maxWidth && text && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 20;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  } else if (text) {
    ctx.fillText(text, x, y);
  }
};

// Generate full pricing table as PNG using Canvas API
export const generateFullPricingPng = async (categories: PriceCategory[]): Promise<Blob> => {
  await loadGoogleFonts();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate canvas dimensions with dynamic item heights based on content
  const padding = 50;
  const headerHeight = 100;
  const categoryHeaderHeight = 70;
  const baseItemRowHeight = 50; // Minimum height for items
  const spaceBetweenCategories = 40;
  const tableHeaderHeight = 45;
  
  // Function to calculate required height for an item based on its description
  const calculateItemHeight = (item: any): number => {
    const minHeight = baseItemRowHeight;
    const maxWidth = 200; // Max width for description column
    
    if (!item.description || item.description.trim() === '') {
      return minHeight + 20; // Base height + small padding
    }
    
    // Set font for measurement
    ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
    const lines = wrapText(ctx, item.description, maxWidth);
    const lineHeight = 18; // Line height for descriptions
    const descriptionHeight = lines.length * lineHeight;
    
    // Calculate total needed height: base content + description + padding
    const neededHeight = Math.max(minHeight, 35 + descriptionHeight + 25); // Service name + description + padding
    
    return neededHeight;
  };
  
  // Calculate total height with dynamic item heights
  let totalHeight = headerHeight + padding * 2 + 40; // Extra space at top
  categories.forEach(category => {
    totalHeight += categoryHeaderHeight + tableHeaderHeight + spaceBetweenCategories;
    category.items.forEach(item => {
      totalHeight += calculateItemHeight(item);
    });
  });

  canvas.width = 850; // Slightly wider for better proportions
  canvas.height = totalHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = padding + 20; // Extra top margin

  // Draw main title with better spacing
  ctx.fillStyle = '#EC4899';
  ctx.font = `bold 36px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY + 50);
  currentY += headerHeight + 30; // More space after title

  // Draw categories
  categories.forEach((category, categoryIndex) => {
    // Category header with rounded corners
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, categoryHeaderHeight, 12);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, category.title, canvas.width / 2, currentY + categoryHeaderHeight / 2, canvas.width - padding * 4);
    currentY += categoryHeaderHeight;

    // Table headers
    const tableStartY = currentY;
    const nameColumnX = padding + 20;
    const descColumnX = nameColumnX + 250;
    const priceColumnX = canvas.width - padding - 20;

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

    // Table items with dynamic heights based on content
    category.items.forEach((item, itemIndex) => {
      const isEven = itemIndex % 2 === 0;
      const itemHeight = calculateItemHeight(item);
      
      // Row background with rounded corners
      ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
      if (isEven) {
        drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 6);
      }

      // Service name positioned at top of row with proper spacing
      ctx.fillStyle = '#333333';
      ctx.font = `500 16px ${FONTS.poppins}, sans-serif`;
      drawLeftText(ctx, item.name, nameColumnX, currentY + 15, 240);

      // Description positioned in its own column with proper wrapping and spacing
      if (item.description) {
        ctx.fillStyle = '#666666';
        ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
        drawLeftText(ctx, item.description, descColumnX, currentY + 15, 200);
      }

      // Price centered vertically in row
      ctx.fillStyle = '#EC4899';
      ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatPrice(item.price), priceColumnX, currentY + itemHeight / 2);

      currentY += itemHeight;
    });

    // Add spacing between categories
    if (categoryIndex < categories.length - 1) {
      currentY += spaceBetweenCategories;
    }
  });

  // Footer
  currentY += 30;
  ctx.fillStyle = '#666666';
  ctx.font = `400 12px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, 'Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
  currentY += 20;
  drawCenteredText(ctx, `Wygenerowano ${new Date().toLocaleDateString('pl-PL')}`, canvas.width / 2, currentY);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Nie udało się utworzyć obrazu');
      }
    }, 'image/png', 1.0);
  });
};

// Generate single category PNG in 9:16 format using Canvas API
export const generateSingleCategoryPng = async (category: PriceCategory): Promise<Blob> => {
  await loadGoogleFonts();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 9:16 aspect ratio
  canvas.width = 450;
  canvas.height = 800;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padding = 20;
  let currentY = padding;

  // Brand title
  ctx.fillStyle = '#EC4899';
  ctx.font = `700 22px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Zastrzyk Piękna', canvas.width / 2, currentY + 20);
  currentY += 60;

  // Category title with rounded corners
  ctx.fillStyle = '#EC4899';
  drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, 50, 12);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 18px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 25, canvas.width - padding * 4);
  currentY += 70;

  // Items
  const itemHeight = 70;
  category.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    
    // Item background with rounded corners
    ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
    if (isEven) {
      drawRoundedRect(ctx, padding, currentY, canvas.width - padding * 2, itemHeight, 8);
    }

    // Service name
    ctx.fillStyle = '#333333';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    drawLeftText(ctx, item.name, padding + 15, currentY + 18, canvas.width - padding * 2 - 30);

    // Price
    ctx.fillStyle = '#EC4899';
    ctx.font = `600 15px ${FONTS.poppins}, sans-serif`;
    drawLeftText(ctx, formatPrice(item.price), padding + 15, currentY + 38, canvas.width - padding * 2 - 30);

    // Description
    if (item.description) {
      ctx.fillStyle = '#666666';
      ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
      drawLeftText(ctx, item.description, padding + 15, currentY + 58, canvas.width - padding * 2 - 30);
    }

    currentY += itemHeight;
  });

  // Footer
  currentY = canvas.height - 60;
  ctx.fillStyle = '#666666';
  ctx.font = `400 11px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, 'Gabinet Kosmetologii Estetycznej', canvas.width / 2, currentY);
  drawCenteredText(ctx, new Date().toLocaleDateString('pl-PL'), canvas.width / 2, currentY + 20);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Nie udało się utworzyć obrazu');
      }
    }, 'image/png', 1.0);
  });
};