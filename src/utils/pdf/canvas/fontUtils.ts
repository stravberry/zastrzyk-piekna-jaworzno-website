// Font configuration and loading utilities for canvas PNG generation

export const FONTS = {
  playfair: 'Playfair Display',
  poppins: 'Poppins'
} as const;

// Load Google Fonts using FontFace API
export const loadGoogleFonts = async (): Promise<void> => {
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
export const formatPrice = (price: string): string => {
  if (price.toLowerCase().includes('zł')) {
    return price;
  }
  return price.trim() + ' zł';
};