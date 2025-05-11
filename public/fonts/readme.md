
# Fonts for PDF Generation

This directory contains fonts used for PDF generation with proper Polish character support.

## Fonts:

- **Roboto-Regular.ttf** - Used for PDF generation with Polish character support

## Usage

These fonts are loaded dynamically when generating PDFs to ensure proper rendering of Polish characters.
Make sure this directory contains the actual font files referenced in the code.

## Adding New Fonts

To add additional fonts:

1. Place the font file in this directory
2. Update the font loading code in `src/utils/pdf/fontSupport.ts`

## Font Sources

The Roboto font can be downloaded from Google Fonts: https://fonts.google.com/specimen/Roboto
