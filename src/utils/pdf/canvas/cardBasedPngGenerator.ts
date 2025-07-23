// Card-based PNG generator with improved quality and spacing
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { PngGenerationConfig, DEFAULT_CONFIG } from "@/services/pricing/pricingPngConfig";

interface CardDimensions {
  width: number;
  height: number;
  padding: number;
  margin: number;
}

interface RenderConfig {
  scale: number;
  cardDimensions: CardDimensions;
  colors: {
    background: string;
    cardBackground: string;
    cardBorder: string;
    primary: string;
    secondary: string;
    text: string;
    price: string;
  };
}

// Create rounded rectangle
function drawRoundedCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string,
  strokeColor?: string,
  lineWidth: number = 1
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  
  ctx.fillStyle = fillColor;
  ctx.fill();
  
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// High-quality render configuration
const RENDER_CONFIG: RenderConfig = {
  scale: window.devicePixelRatio || 2,
  cardDimensions: {
    width: 400,
    height: 'auto' as any,
    padding: 24,
    margin: 20,
  },
  colors: {
    background: '#ffffff',
    cardBackground: '#ffffff',
    cardBorder: '#e2e8f0',
    primary: '#ec4899',
    secondary: '#64748b',
    text: '#1e293b',
    price: '#ec4899',
  },
};

// Calculate card height based on content
function calculateCardHeight(
  ctx: CanvasRenderingContext2D,
  item: PriceItem,
  config: RenderConfig
): number {
  const { cardDimensions } = config;
  let height = cardDimensions.padding * 2; // Top and bottom padding

  // Name height (bold, larger font)
  ctx.font = `bold ${16 * config.scale}px system-ui, -apple-system, sans-serif`;
  const nameLines = wrapText(ctx, item.name, cardDimensions.width - cardDimensions.padding * 2);
  height += nameLines.length * 24 * config.scale;

  // Space between name and price
  height += 8 * config.scale;

  // Price height
  ctx.font = `600 ${14 * config.scale}px system-ui, -apple-system, sans-serif`;
  height += 20 * config.scale;

  // Description height (if exists)
  if (item.description) {
    height += 12 * config.scale; // Space before description
    ctx.font = `400 ${12 * config.scale}px system-ui, -apple-system, sans-serif`;
    const descLines = wrapText(ctx, item.description, cardDimensions.width - cardDimensions.padding * 2);
    height += descLines.length * 18 * config.scale;
  }

  return Math.max(height, 80 * config.scale); // Minimum height
}

// Improved text wrapping
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [''];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word); // Single word too long, force it
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [''];
}

// Draw a single treatment card
function drawTreatmentCard(
  ctx: CanvasRenderingContext2D,
  item: PriceItem,
  x: number,
  y: number,
  width: number,
  height: number,
  config: RenderConfig
): void {
  const { cardDimensions, colors } = config;
  
  // Draw rounded card with subtle border
  const borderRadius = 12 * config.scale;
  drawRoundedCard(
    ctx,
    x,
    y,
    width,
    height,
    borderRadius,
    colors.cardBackground,
    colors.cardBorder,
    1.5 * config.scale
  );
  
  let currentY = y + cardDimensions.padding;
  
  // Draw treatment name (bold, larger)
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${16 * config.scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  
  const nameLines = wrapText(ctx, item.name, width - cardDimensions.padding * 2);
  nameLines.forEach(line => {
    ctx.fillText(line, x + cardDimensions.padding, currentY);
    currentY += 24 * config.scale;
  });
  
  // Space between name and price
  currentY += 8 * config.scale;
  
  // Draw price (prominent, colored)
  ctx.fillStyle = colors.price;
  ctx.font = `600 ${14 * config.scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  
  const price = item.price.includes('zł') ? item.price : `${item.price} zł`;
  ctx.fillText(price, x + width - cardDimensions.padding, currentY);
  currentY += 20 * config.scale;
  
  // Draw description (smaller, lighter)
  if (item.description) {
    currentY += 12 * config.scale; // Space before description
    
    ctx.fillStyle = colors.secondary;
    ctx.font = `400 ${12 * config.scale}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    
    const descLines = wrapText(ctx, item.description, width - cardDimensions.padding * 2);
    descLines.forEach(line => {
      ctx.fillText(line, x + cardDimensions.padding, currentY);
      currentY += 18 * config.scale;
    });
  }
}

// Generate single category PNG with card-based layout
export async function generateCardBasedCategoryPng(
  category: PriceCategory,
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob> {
  const renderConfig = { 
    ...RENDER_CONFIG,
    scale: config.scale || RENDER_CONFIG.scale,
    cardDimensions: {
      ...RENDER_CONFIG.cardDimensions,
      width: config.canvasWidth ? config.canvasWidth * 0.85 : RENDER_CONFIG.cardDimensions.width,
      padding: config.padding || RENDER_CONFIG.cardDimensions.padding,
      margin: Math.round((config.padding || 20) * 1.2),
    }
  };
  
  // Create high-resolution canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate total dimensions
  const pageWidth = (config.canvasWidth || 450) * renderConfig.scale;
  const headerHeight = 100 * renderConfig.scale;
  const footerHeight = 40 * renderConfig.scale;
  
  // Calculate card heights
  const cardHeights = category.items.map(item => 
    calculateCardHeight(ctx, item, renderConfig)
  );
  
  const totalContentHeight = cardHeights.reduce((sum, height) => 
    sum + height + renderConfig.cardDimensions.margin * renderConfig.scale, 0
  );
  
  const totalHeight = headerHeight + totalContentHeight + footerHeight;
  
  // Set canvas dimensions
  canvas.width = pageWidth;
  canvas.height = totalHeight;
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textBaseline = 'top';
  
  // Clear background
  ctx.fillStyle = renderConfig.colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw header
  ctx.fillStyle = renderConfig.colors.primary;
  ctx.font = `bold ${28 * renderConfig.scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    'Kosmetolog Anna Gajęcka',
    pageWidth / 2,
    25 * renderConfig.scale
  );
  
  ctx.fillStyle = renderConfig.colors.text;
  ctx.font = `600 ${20 * renderConfig.scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(
    category.title,
    pageWidth / 2,
    65 * renderConfig.scale
  );
  
  // Draw treatment cards
  let currentY = headerHeight + 20 * renderConfig.scale;
  const cardWidth = renderConfig.cardDimensions.width * renderConfig.scale;
  const cardX = (pageWidth - cardWidth) / 2;
  
  category.items.forEach((item, index) => {
    const cardHeight = cardHeights[index];
    
    drawTreatmentCard(
      ctx,
      item,
      cardX,
      currentY,
      cardWidth,
      cardHeight,
      renderConfig
    );
    
    currentY += cardHeight + renderConfig.cardDimensions.margin * renderConfig.scale;
  });
  
  // Convert to blob with proper scaling
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/png',
      1.0
    );
  });
}

// Generate full pricing PNG with card-based layout
export async function generateCardBasedFullPricingPng(
  categories: PriceCategory[],
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob> {
  const renderConfig = { 
    ...RENDER_CONFIG,
    scale: config.scale || RENDER_CONFIG.scale,
    cardDimensions: {
      ...RENDER_CONFIG.cardDimensions,
      width: config.canvasWidth ? config.canvasWidth * 0.85 : RENDER_CONFIG.cardDimensions.width,
      padding: config.padding || RENDER_CONFIG.cardDimensions.padding,
      margin: Math.round((config.padding || 20) * 1.2),
    }
  };
  
  // Create high-resolution canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Calculate dimensions for all categories
  const pageWidth = (config.canvasWidth || 450) * renderConfig.scale;
  const headerHeight = 100 * renderConfig.scale;
  const categoryHeaderHeight = 60 * renderConfig.scale;
  const footerHeight = 40 * renderConfig.scale;
  
  let totalHeight = headerHeight + footerHeight;
  
  // Calculate height for each category
  const categoryData = categories.map(category => {
    const cardHeights = category.items.map(item => 
      calculateCardHeight(ctx, item, renderConfig)
    );
    const categoryContentHeight = cardHeights.reduce((sum, height) => 
      sum + height + renderConfig.cardDimensions.margin * renderConfig.scale, 0
    );
    
    totalHeight += categoryHeaderHeight + categoryContentHeight + 30 * renderConfig.scale;
    
    return { category, cardHeights, categoryContentHeight };
  });
  
  // Set canvas dimensions
  canvas.width = pageWidth;
  canvas.height = totalHeight;
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textBaseline = 'top';
  
  // Clear background
  ctx.fillStyle = renderConfig.colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw main header
  ctx.fillStyle = renderConfig.colors.primary;
  ctx.font = `bold ${28 * renderConfig.scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    'Kosmetolog Anna Gajęcka - Cennik',
    pageWidth / 2,
    25 * renderConfig.scale
  );
  
  // Draw categories
  let currentY = headerHeight + 20 * renderConfig.scale;
  const cardWidth = renderConfig.cardDimensions.width * renderConfig.scale;
  const cardX = (pageWidth - cardWidth) / 2;
  
  categoryData.forEach(({ category, cardHeights }) => {
    // Draw category header
    ctx.fillStyle = renderConfig.colors.primary;
    ctx.font = `600 ${16 * renderConfig.scale}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      category.title,
      pageWidth / 2,
      currentY
    );
    
    currentY += categoryHeaderHeight;
    
    // Draw treatment cards for this category
    category.items.forEach((item, index) => {
      const cardHeight = cardHeights[index];
      
      drawTreatmentCard(
        ctx,
        item,
        cardX,
        currentY,
        cardWidth,
        cardHeight,
        renderConfig
      );
      
      currentY += cardHeight + renderConfig.cardDimensions.margin * renderConfig.scale;
    });
    
    // Space between categories
    currentY += 30 * renderConfig.scale;
  });
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/png',
      1.0
    );
  });
}

// Split large categories into pages
export async function generateCardBasedCategoryPages(
  category: PriceCategory,
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob[]> {
  const renderConfig = { ...RENDER_CONFIG };
  const maxPageHeight = 1000 * renderConfig.scale; // Maximum page height
  const headerHeight = 80 * renderConfig.scale;
  const footerHeight = 40 * renderConfig.scale;
  const availableHeight = maxPageHeight - headerHeight - footerHeight;
  
  // Create temporary canvas for measurements
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Calculate card heights
  const cardHeights = category.items.map(item => 
    calculateCardHeight(tempCtx, item, renderConfig)
  );
  
  // Split items into pages
  const pages: { items: PriceItem[], heights: number[] }[] = [];
  let currentPageItems: PriceItem[] = [];
  let currentPageHeights: number[] = [];
  let currentPageHeight = 0;
  
  category.items.forEach((item, index) => {
    const cardHeight = cardHeights[index] + renderConfig.cardDimensions.margin * renderConfig.scale;
    
    if (currentPageHeight + cardHeight > availableHeight && currentPageItems.length > 0) {
      // Start new page
      pages.push({ items: [...currentPageItems], heights: [...currentPageHeights] });
      currentPageItems = [item];
      currentPageHeights = [cardHeights[index]];
      currentPageHeight = cardHeight;
    } else {
      currentPageItems.push(item);
      currentPageHeights.push(cardHeights[index]);
      currentPageHeight += cardHeight;
    }
  });
  
  if (currentPageItems.length > 0) {
    pages.push({ items: currentPageItems, heights: currentPageHeights });
  }
  
  // Generate PNG for each page
  const blobs: Blob[] = [];
  
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    const pageCategory: PriceCategory = {
      ...category,
      title: pages.length > 1 ? `${category.title} (${pageIndex + 1}/${pages.length})` : category.title,
      items: page.items,
    };
    
    const blob = await generateCardBasedCategoryPng(pageCategory, config);
    blobs.push(blob);
  }
  
  return blobs;
}