// Card-based PNG generator with smart dynamic pagination
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { PngGenerationConfig, DEFAULT_CONFIG } from "@/services/pricing/pricingPngConfig";
import { 
  smartPageBreaking, 
  calculateOptimalFontSizes, 
  calculateSmartCardHeight,
  wrapTextSmart,
  getSmartPaginationConfig,
  previewOptimization,
  FontConfig,
  PaginationConfig
} from "./smartPagination";

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

// High-quality render configuration for Instagram Stories
const RENDER_CONFIG: RenderConfig = {
  scale: 1, // No scaling needed for direct dimensions
  cardDimensions: {
    width: 900, // Wider cards for Instagram format
    height: 'auto' as any,
    padding: 30, // Reduced padding for more space
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

  // Name height (bold, larger font for Instagram)
  ctx.font = `bold 24px system-ui, -apple-system, sans-serif`;
  const nameLines = wrapText(ctx, item.name, cardDimensions.width - cardDimensions.padding * 2);
  height += nameLines.length * 32;

  // Space between name and price
  height += 12;
  
  // Price height
  ctx.font = `600 18px system-ui, -apple-system, sans-serif`;
  height += 26;

  // Description height (if exists)
  if (item.description) {
    height += 16; // Space before description
    ctx.font = `400 16px system-ui, -apple-system, sans-serif`;
    const descLines = wrapText(ctx, item.description, cardDimensions.width - cardDimensions.padding * 2);
    height += descLines.length * 22;
  }
  
  return Math.max(height, 120); // Minimum height for Instagram
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

// Draw a single treatment card with dynamic font sizing
function drawSmartTreatmentCard(
  ctx: CanvasRenderingContext2D,
  item: PriceItem,
  x: number,
  y: number,
  width: number,
  height: number,
  config: RenderConfig,
  fontConfig: FontConfig
): void {
  const { cardDimensions, colors } = config;
  
  // Draw rounded card with larger border radius for Instagram
  const borderRadius = 20; // Larger radius for Instagram format
  drawRoundedCard(
    ctx,
    x,
    y,
    width,
    height,
    borderRadius,
    colors.cardBackground,
    colors.cardBorder,
    2
  );
  
  let currentY = y + cardDimensions.padding;
  
  // Draw treatment name (bold, dynamic size)
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${fontConfig.treatmentName}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  
  const nameLines = wrapTextSmart(ctx, item.name, width - cardDimensions.padding * 2);
  nameLines.forEach(line => {
    ctx.fillText(line, x + cardDimensions.padding, currentY);
    currentY += fontConfig.treatmentName * 1.4;
  });
  
  // Space between name and price
  currentY += 12;
  
  // Draw price (prominent, colored, dynamic size)
  ctx.fillStyle = colors.price;
  ctx.font = `600 ${fontConfig.price}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  
  const price = item.price.includes('zł') ? item.price : `${item.price} zł`;
  ctx.fillText(price, x + width - cardDimensions.padding, currentY);
  currentY += fontConfig.price * 1.4;
  
  // Draw description (dynamic size)
  if (item.description) {
    currentY += 16; // Space before description
    
    ctx.fillStyle = colors.secondary;
    ctx.font = `400 ${fontConfig.description}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    
    const descLines = wrapTextSmart(ctx, item.description, width - cardDimensions.padding * 2);
    descLines.forEach(line => {
      ctx.fillText(line, x + cardDimensions.padding, currentY);
      currentY += fontConfig.description * 1.3;
    });
  }
}

// Generate single category PNG - ALWAYS one file for the entire category
export async function generateCardBasedCategoryPng(
  category: PriceCategory,
  config: PngGenerationConfig = DEFAULT_CONFIG
): Promise<Blob> {
  console.log('🎨 =================================');
  console.log('🎨 GENERATING SINGLE CATEGORY PNG');
  console.log('🎨 =================================');
  console.log('📝 Category:', category.title);
  console.log('📝 Input items count:', category.items.length);
  
  // Log all input items for debugging
  console.log('📝 All input items:');
  category.items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} - ${item.price} - ${item.description?.substring(0, 50)}...`);
  });

  // Determine quality mode based on config or default to aesthetic
  const qualityMode = (config as any).qualityMode || 'aesthetic';
  console.log('📝 Quality mode:', qualityMode);
  
  // Calculate optimal font sizes for ALL items in the category
  const fontConfig = calculateOptimalFontSizes(
    category.items.length,
    qualityMode,
    config.canvasHeight || 1920
  );
  
  console.log('🔧 Font configuration:', fontConfig);
  
  const renderConfig = { 
    ...RENDER_CONFIG,
    scale: config.scale || RENDER_CONFIG.scale,
    cardDimensions: {
      ...RENDER_CONFIG.cardDimensions,
      width: config.canvasWidth ? config.canvasWidth * 0.9 : RENDER_CONFIG.cardDimensions.width,
      padding: config.padding || RENDER_CONFIG.cardDimensions.padding,
      margin: Math.round((config.padding || 20) * 1.2),
    }
  };
  
  // Create high-resolution canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Use config dimensions directly for proper Instagram Stories format
  const pageWidth = config.canvasWidth || 1080;
  const pageHeight = config.canvasHeight || 1920;
  
  // ALWAYS use ALL items from category - NO pagination for single category
  const pageItems = category.items;
  
  console.log('✅ Using ALL items (no pagination):', {
    categoryItems: category.items.length,
    pageItems: pageItems.length,
    itemsMatch: category.items.length === pageItems.length
  });
  
  // Calculate available space
  const headerHeight = 100;
  const footerSpace = 60;
  const availableHeight = pageHeight - headerHeight - footerSpace;
  const singleCardWidth = pageWidth * 0.9;
  
  console.log('🎯 Generating single PNG with all items:', {
    totalItems: pageItems.length,
    availableHeight,
    pageHeight,
    headerHeight
  });
  
  // Calculate card heights with current font config
  let adjustedFontConfig = { ...fontConfig };
  let adjustedPadding = renderConfig.cardDimensions.padding;
  
  // Try with normal settings first
  let cardHeights = pageItems.map(item => 
    calculateSmartCardHeight(ctx, item, adjustedFontConfig, singleCardWidth, adjustedPadding)
  );
  let totalHeight = cardHeights.reduce((sum, height) => sum + height + 10, 0);
  
  // If doesn't fit, reduce font sizes and padding
  if (totalHeight > availableHeight) {
    adjustedPadding = 20; // Reduce padding
    adjustedFontConfig = {
      treatmentName: Math.max(adjustedFontConfig.treatmentName * 0.85, 16),
      description: Math.max(adjustedFontConfig.description * 0.85, 12),
      price: Math.max(adjustedFontConfig.price * 0.85, 14),
      categoryHeader: Math.max(adjustedFontConfig.categoryHeader * 0.9, 16),
      mainHeader: Math.max(adjustedFontConfig.mainHeader * 0.9, 20)
    };
    
    // Recalculate with smaller fonts
    cardHeights = pageItems.map(item => 
      calculateSmartCardHeight(ctx, item, adjustedFontConfig, singleCardWidth, adjustedPadding)
    );
    totalHeight = cardHeights.reduce((sum, height) => sum + height + 10, 0);
    
    console.log('🔧 Adjusted fonts and padding:', {
      newTotalHeight: totalHeight,
      willFit: totalHeight <= availableHeight,
      newPadding: adjustedPadding
    });
  }
  
  // Set canvas dimensions to Instagram Stories format
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  
  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.textBaseline = 'top';
  
  // Clear background
  ctx.fillStyle = renderConfig.colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw header with dynamic fonts
  ctx.fillStyle = renderConfig.colors.primary;
  ctx.font = `bold ${fontConfig.mainHeader}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    'Kosmetolog Anna Gajęcka',
    pageWidth / 2,
    40
  );
  
  ctx.fillStyle = renderConfig.colors.text;
  ctx.font = `600 ${fontConfig.categoryHeader}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(
    category.title, // Always just the category title - no pagination info
    pageWidth / 2,
    90
  );
  
  // Draw treatment cards with optimized layout
  let currentY = headerHeight + 40; // Start after header
  const finalCardWidth = singleCardWidth;
  const cardX = (pageWidth - finalCardWidth) / 2;
  
  console.log('🖼️ Drawing treatment cards:');
  pageItems.forEach((item, index) => {
    const cardHeight = cardHeights[index];
    
    console.log(`  ➤ Drawing card ${index + 1}/${pageItems.length}: "${item.name}" at Y=${currentY}, height=${cardHeight}`);
    
    drawSmartTreatmentCard(
      ctx,
      item,
      cardX,
      currentY,
      finalCardWidth,
      cardHeight,
      renderConfig,
      adjustedFontConfig // Use adjusted font config
    );
    
    currentY += cardHeight + 10; // Consistent margin
    console.log(`    ✅ Card drawn, next Y position: ${currentY}`);
  });
  
  console.log('🎯 Final rendering complete:', {
    totalCardsDrawn: pageItems.length,
    finalYPosition: currentY,
    canvasHeight: pageHeight
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
  const fullPricingCardWidth = renderConfig.cardDimensions.width * renderConfig.scale;
  const cardX = (pageWidth - fullPricingCardWidth) / 2;
  
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
      
      // Use legacy function for full pricing - will be updated in future
      const legacyFontConfig: FontConfig = {
        treatmentName: 24,
        description: 16,
        price: 18,
        categoryHeader: 20,
        mainHeader: 28
      };
      
      drawSmartTreatmentCard(
        ctx,
        item,
        cardX,
        currentY,
        fullPricingCardWidth,
        cardHeight,
        renderConfig,
        legacyFontConfig
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