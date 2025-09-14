// Font configuration and loading utilities for canvas PNG generation

export const FONTS = {
  playfair: 'Playfair Display',
  poppins: 'Poppins'
} as const;

// Load Google Fonts using FontFace API with proper font file URLs
export const loadGoogleFonts = async (): Promise<void> => {
  try {
    // Load Playfair Display with direct font file URLs
    const playfairRegular = new FontFace(
      FONTS.playfair, 
      'url(https://fonts.gstatic.com/s/playfairdisplay/v37/nwpXtK2oNAte0S-V-PGJISEjZhPH.woff2)'
    );
    const playfairBold = new FontFace(
      FONTS.playfair, 
      'url(https://fonts.gstatic.com/s/playfairdisplay/v37/nwpZtK2oNAte0S-V-PGJISEjZhPHu8bA.woff2)',
      { weight: '700' }
    );
    
    await playfairRegular.load();
    await playfairBold.load();
    document.fonts.add(playfairRegular);
    document.fonts.add(playfairBold);

    // Load Poppins with direct font file URLs
    const poppinsRegular = new FontFace(
      FONTS.poppins,
      'url(https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2)'
    );
    const poppinsSemiBold = new FontFace(
      FONTS.poppins,
      'url(https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2)',
      { weight: '600' }
    );
    const poppinsBold = new FontFace(
      FONTS.poppins,
      'url(https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2)',
      { weight: '700' }
    );
    
    await poppinsRegular.load();
    await poppinsSemiBold.load();
    await poppinsBold.load();
    document.fonts.add(poppinsRegular);
    document.fonts.add(poppinsSemiBold);
    document.fonts.add(poppinsBold);

    // Wait for fonts to be ready
    await document.fonts.ready;
    console.log('Google Fonts loaded successfully');
  } catch (error) {
    console.warn('Failed to load Google Fonts, using system fonts:', error);
    // Ensure fonts are still available as fallback
    await document.fonts.ready;
  }
};

// Format price with Polish currency
export const formatPrice = (price: string): string => {
  if (price.toLowerCase().includes('zł')) {
    return price;
  }
  return price.trim() + ' zł';
};