// Single category PNG generator

import { PriceCategory } from "@/components/pricing/PriceCard";
import { loadGoogleFonts, FONTS, formatPrice } from './fontUtils';
import { drawRoundedRect, drawCenteredText, drawLeftText } from './drawingUtils';

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