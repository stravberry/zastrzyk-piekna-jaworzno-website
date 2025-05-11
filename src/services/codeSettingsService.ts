
import { supabase } from "@/integrations/supabase/client";

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

// Get code settings
export const getCodeSettings = async (): Promise<CodeSettings> => {
  try {
    // Try to fetch from Supabase if available
    const { data: settings, error } = await supabase
      .from('code_settings')
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching code settings from Supabase:', error);
      throw error;
    }
    
    // If settings exist in database, return them
    if (settings) {
      return {
        headCode: settings.head_code || defaultGTMHead,
        bodyCode: settings.body_code || defaultGTMBody,
      };
    }
    
    // If no settings in database, try localStorage as fallback
    const headCode = localStorage.getItem('headCode');
    const bodyCode = localStorage.getItem('bodyCode');
    
    // If settings exist in localStorage, return them
    if (headCode || bodyCode) {
      return {
        headCode: headCode || defaultGTMHead,
        bodyCode: bodyCode || defaultGTMBody,
      };
    }
    
    // If no settings exist anywhere, return default GTM snippets
    return {
      headCode: defaultGTMHead,
      bodyCode: defaultGTMBody,
    };
  } catch (error) {
    console.error('Error in getCodeSettings:', error);
    
    // As a last resort, try localStorage
    try {
      const headCode = localStorage.getItem('headCode');
      const bodyCode = localStorage.getItem('bodyCode');
      
      return {
        headCode: headCode || defaultGTMHead,
        bodyCode: bodyCode || defaultGTMBody,
      };
    } catch (e) {
      // If everything fails, return default GTM snippets
      return {
        headCode: defaultGTMHead,
        bodyCode: defaultGTMBody,
      };
    }
  }
};

// Update code settings
export const updateCodeSettings = async (settings: CodeSettings): Promise<void> => {
  try {
    // Try to update in Supabase
    const { error } = await supabase
      .from('code_settings')
      .upsert({
        id: 1, // Use a single record with ID 1 for settings
        head_code: settings.headCode,
        body_code: settings.bodyCode,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error updating code settings in Supabase:', error);
      
      // Fall back to localStorage if Supabase fails
      localStorage.setItem('headCode', settings.headCode);
      localStorage.setItem('bodyCode', settings.bodyCode);
    }
  } catch (error) {
    console.error('Error in updateCodeSettings:', error);
    
    // Fall back to localStorage if Supabase is unavailable
    localStorage.setItem('headCode', settings.headCode);
    localStorage.setItem('bodyCode', settings.bodyCode);
  }
};
