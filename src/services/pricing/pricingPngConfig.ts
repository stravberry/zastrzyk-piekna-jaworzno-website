// Configuration service for PNG generation with different presets

export interface PngGenerationConfig {
  maxItemsPerPage: number;
  minItemHeight: number;
  maxItemHeight: number;
  padding: number;
  lineSpacing: number;
  nameColumnWidth: number;
  descColumnWidth: number;
  priceColumnWidth: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Default configuration for balanced layout
export const DEFAULT_CONFIG: PngGenerationConfig = {
  maxItemsPerPage: 6,
  minItemHeight: 60,
  maxItemHeight: 200,
  padding: 20,
  lineSpacing: 18,
  nameColumnWidth: 280,
  descColumnWidth: 220,
  priceColumnWidth: 120,
  canvasWidth: 450,
  canvasHeight: 800,
};

// Compact configuration for more items per page
export const COMPACT_CONFIG: PngGenerationConfig = {
  maxItemsPerPage: 8,
  minItemHeight: 45,
  maxItemHeight: 150,
  padding: 15,
  lineSpacing: 16,
  nameColumnWidth: 260,
  descColumnWidth: 200,
  priceColumnWidth: 100,
  canvasWidth: 450,
  canvasHeight: 800,
};

// Spacious configuration for better readability
export const SPACIOUS_CONFIG: PngGenerationConfig = {
  maxItemsPerPage: 4,
  minItemHeight: 80,
  maxItemHeight: 250,
  padding: 25,
  lineSpacing: 20,
  nameColumnWidth: 300,
  descColumnWidth: 240,
  priceColumnWidth: 140,
  canvasWidth: 450,
  canvasHeight: 800,
};

// High resolution configuration for print quality
export const PRINT_CONFIG: PngGenerationConfig = {
  maxItemsPerPage: 6,
  minItemHeight: 120,
  maxItemHeight: 400,
  padding: 40,
  lineSpacing: 36,
  nameColumnWidth: 560,
  descColumnWidth: 440,
  priceColumnWidth: 240,
  canvasWidth: 900,
  canvasHeight: 1600,
};

// Get configuration by name
export const getConfigByName = (configName: 'default' | 'compact' | 'spacious' | 'print'): PngGenerationConfig => {
  switch (configName) {
    case 'compact':
      return COMPACT_CONFIG;
    case 'spacious':
      return SPACIOUS_CONFIG;
    case 'print':
      return PRINT_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
};

// Configuration with automatic selection based on content
export const getAutoConfig = (itemCount: number, hasLongDescriptions: boolean): PngGenerationConfig => {
  if (itemCount <= 3) {
    return SPACIOUS_CONFIG;
  } else if (itemCount >= 8 || !hasLongDescriptions) {
    return COMPACT_CONFIG;
  } else {
    return DEFAULT_CONFIG;
  }
};

// Validate and adjust configuration
export const validateConfig = (config: Partial<PngGenerationConfig>): PngGenerationConfig => {
  return {
    maxItemsPerPage: Math.max(1, Math.min(config.maxItemsPerPage || DEFAULT_CONFIG.maxItemsPerPage, 15)),
    minItemHeight: Math.max(30, config.minItemHeight || DEFAULT_CONFIG.minItemHeight),
    maxItemHeight: Math.max(100, config.maxItemHeight || DEFAULT_CONFIG.maxItemHeight),
    padding: Math.max(10, config.padding || DEFAULT_CONFIG.padding),
    lineSpacing: Math.max(12, config.lineSpacing || DEFAULT_CONFIG.lineSpacing),
    nameColumnWidth: Math.max(100, config.nameColumnWidth || DEFAULT_CONFIG.nameColumnWidth),
    descColumnWidth: Math.max(100, config.descColumnWidth || DEFAULT_CONFIG.descColumnWidth),
    priceColumnWidth: Math.max(80, config.priceColumnWidth || DEFAULT_CONFIG.priceColumnWidth),
    canvasWidth: Math.max(300, config.canvasWidth || DEFAULT_CONFIG.canvasWidth),
    canvasHeight: Math.max(400, config.canvasHeight || DEFAULT_CONFIG.canvasHeight),
  };
};