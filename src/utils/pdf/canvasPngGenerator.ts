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

// Draw text with precise centering
const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxWidth);
};

// Draw left-aligned text
const drawLeftText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxWidth);
};

// Draw right-aligned text
const drawRightText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxWidth);
};

// Generate full pricing table as PNG using Canvas API
export const generateFullPricingPng = async (categories: PriceCategory[]): Promise<Blob> => {
  await loadGoogleFonts();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate canvas dimensions
  const padding = 40;
  const headerHeight = 80;
  const categoryHeaderHeight = 60;
  const itemRowHeight = 50;
  const spaceBetweenCategories = 30;
  
  let totalHeight = headerHeight + padding * 2;
  categories.forEach(category => {
    totalHeight += categoryHeaderHeight + (category.items.length * itemRowHeight) + spaceBetweenCategories;
  });

  canvas.width = 800;
  canvas.height = totalHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = padding;

  // Draw main title
  ctx.fillStyle = '#EC4899';
  ctx.font = `bold 32px ${FONTS.playfair}, serif`;
  drawCenteredText(ctx, 'Cennik Usług', canvas.width / 2, currentY + 40);
  currentY += headerHeight + 20;

  // Draw categories
  categories.forEach((category, categoryIndex) => {
    // Category header
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(padding, currentY, canvas.width - padding * 2, categoryHeaderHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 24px ${FONTS.poppins}, sans-serif`;
    drawCenteredText(ctx, category.title, canvas.width / 2, currentY + categoryHeaderHeight / 2);
    currentY += categoryHeaderHeight;

    // Table headers
    const tableStartY = currentY;
    const nameColumnX = padding + 20;
    const descColumnX = nameColumnX + 250;
    const priceColumnX = canvas.width - padding - 20;

    ctx.fillStyle = '#FDF2F8';
    ctx.fillRect(padding, currentY, canvas.width - padding * 2, itemRowHeight);
    
    ctx.fillStyle = '#333333';
    ctx.font = `600 16px ${FONTS.poppins}, sans-serif`;
    drawLeftText(ctx, 'Nazwa zabiegu', nameColumnX, currentY + itemRowHeight / 2);
    drawLeftText(ctx, 'Opis', descColumnX, currentY + itemRowHeight / 2);
    drawRightText(ctx, 'Cena', priceColumnX, currentY + itemRowHeight / 2);
    currentY += itemRowHeight;

    // Table items
    category.items.forEach((item, itemIndex) => {
      const isEven = itemIndex % 2 === 0;
      
      // Row background
      ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
      ctx.fillRect(padding, currentY, canvas.width - padding * 2, itemRowHeight);

      // Service name
      ctx.fillStyle = '#333333';
      ctx.font = `500 14px ${FONTS.poppins}, sans-serif`;
      drawLeftText(ctx, item.name, nameColumnX, currentY + itemRowHeight / 2, 230);

      // Description
      if (item.description) {
        ctx.fillStyle = '#666666';
        ctx.font = `400 13px ${FONTS.poppins}, sans-serif`;
        drawLeftText(ctx, item.description, descColumnX, currentY + itemRowHeight / 2, 200);
      }

      // Price
      ctx.fillStyle = '#EC4899';
      ctx.font = `600 14px ${FONTS.poppins}, sans-serif`;
      drawRightText(ctx, formatPrice(item.price), priceColumnX, currentY + itemRowHeight / 2);

      currentY += itemRowHeight;
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

  // Category title
  ctx.fillStyle = '#EC4899';
  ctx.fillRect(padding, currentY, canvas.width - padding * 2, 50);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 18px ${FONTS.poppins}, sans-serif`;
  drawCenteredText(ctx, category.title, canvas.width / 2, currentY + 25);
  currentY += 70;

  // Items
  const itemHeight = 70;
  category.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    
    // Item background
    ctx.fillStyle = isEven ? '#FCF2F8' : '#ffffff';
    ctx.fillRect(padding, currentY, canvas.width - padding * 2, itemHeight);

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