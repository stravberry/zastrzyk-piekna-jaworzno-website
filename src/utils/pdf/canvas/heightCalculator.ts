// Height calculation utilities for PNG generation

import { wrapText } from './drawingUtils';
import { FONTS } from './fontUtils';

// Enhanced function to calculate required height for an item
export const calculateItemHeight = (
  measureCtx: CanvasRenderingContext2D,
  item: any
): number => {
  const hasDescription = item.description && item.description.trim() !== '';
  const minHeight = hasDescription ? 100 : 70; // Bigger minimum height for items with descriptions
  const nameColumnWidth = 240;
  const descColumnWidth = 200;
  
  // Use measurement context with proper fonts
  measureCtx.font = `600 16px ${FONTS.poppins}, sans-serif`;
  const nameLines = wrapText(measureCtx, item.name || '', nameColumnWidth);
  const nameHeight = nameLines.length * 22; // Line height for names
  
  let descHeight = 0;
  if (hasDescription) {
    measureCtx.font = `400 13px ${FONTS.poppins}, sans-serif`;
    const descLines = wrapText(measureCtx, item.description, descColumnWidth);
    descHeight = descLines.length * 20; // Line height for descriptions
  }
  
  // Calculate total height with generous spacing for descriptions
  const paddingTop = hasDescription ? 20 : 15;
  const spaceBetweenNameAndDesc = hasDescription ? 12 : 0;
  const paddingBottom = hasDescription ? 25 : 15;
  
  const totalContentHeight = nameHeight + spaceBetweenNameAndDesc + descHeight;
  const finalHeight = Math.max(minHeight, totalContentHeight + paddingTop + paddingBottom);
  
  console.log('Item height calc:', {
    name: item.name?.substring(0, 30) + '...',
    hasDesc: hasDescription,
    nameLines: nameLines.length,
    descLines: hasDescription ? wrapText(measureCtx, item.description, descColumnWidth).length : 0,
    nameHeight,
    descHeight,
    totalContentHeight,
    finalHeight,
    minHeight,
    paddingTop,
    paddingBottom,
    spaceBetweenNameAndDesc
  });
  
  return finalHeight;
};