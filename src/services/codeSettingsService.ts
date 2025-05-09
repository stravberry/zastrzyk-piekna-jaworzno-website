
export interface CodeSettings {
  headCode: string;
  bodyCode: string;
}

// Default Google Tag Manager code snippets
const defaultGTMHead = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXX');</script>
<!-- End Google Tag Manager -->`;

const defaultGTMBody = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

// Pobieranie ustawień kodu
export const getCodeSettings = async (): Promise<CodeSettings> => {
  try {
    // If no settings exist, return default GTM snippets
    const headCode = localStorage.getItem('headCode');
    const bodyCode = localStorage.getItem('bodyCode');
    
    return {
      headCode: headCode || defaultGTMHead,
      bodyCode: bodyCode || defaultGTMBody,
    };
  } catch (error) {
    console.error('Error fetching code settings:', error);
    throw error;
  }
};

// Aktualizacja ustawień kodu
export const updateCodeSettings = async (settings: CodeSettings): Promise<void> => {
  try {
    // Symulacja zapisywania do bazy danych
    // W rzeczywistej implementacji zastąp to faktycznym zapisem do bazy
    localStorage.setItem('headCode', settings.headCode);
    localStorage.setItem('bodyCode', settings.bodyCode);
    
    // Dodajemy małe opóźnienie, aby symulować operację sieciową
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return;
  } catch (error) {
    console.error('Error updating code settings:', error);
    throw error;
  }
};
