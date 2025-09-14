// Canvas drawing utilities for PNG generation

// Draw rounded rectangle
export const drawRoundedRect = (
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
export const wrapText = (
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

// Enhanced centered text with proper multiline handling and debugging
export const drawCenteredText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
): void => {
  // Save current context
  const currentFont = ctx.font;
  const currentFillStyle = ctx.fillStyle;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  if (maxWidth && text.length > 0) {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 25; // Increased line height for better readability
    
    console.log(`Drawing centered multiline text "${text}" at x=${x}, y=${y}, lines=${lines.length}, font=${currentFont}`);
    
    lines.forEach((line, index) => {
      const lineY = y + (index * lineHeight);
      // Measure each line to ensure proper centering
      const metrics = ctx.measureText(line);
      console.log(`  Line ${index + 1}: "${line}" at y=${lineY}, width=${metrics.width}`);
      ctx.fillText(line, x, lineY);
    });
  } else {
    // Single line text with measurements
    const metrics = ctx.measureText(text);
    console.log(`Drawing centered single text "${text}" at x=${x}, y=${y}, width=${metrics.width}, font=${currentFont}`);
    ctx.fillText(text, x, y);
  }
  
  // Restore context
  ctx.font = currentFont;
  ctx.fillStyle = currentFillStyle;
};

// Enhanced left-aligned text with better line spacing
export const drawLeftText = (
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
export const drawRightText = (
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