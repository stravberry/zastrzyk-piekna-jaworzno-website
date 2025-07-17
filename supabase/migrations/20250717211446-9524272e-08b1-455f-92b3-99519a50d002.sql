-- Remove contact buttons from email templates

-- Update the 24h reminder template to remove contact button
UPDATE public.email_templates 
SET html_content = REPLACE(
  html_content, 
  '<div class="cta-section">
                <a href="tel:514902242" class="cta-button">📞 Kontakt w razie pytań</a>
            </div>', 
  ''
)
WHERE name = 'reminder_24h';

-- Update the 2h reminder template to remove contact button
UPDATE public.email_templates 
SET html_content = REPLACE(
  html_content, 
  '<div class="cta-section">
                <a href="tel:514902242" class="cta-button">📞 Zadzwoń</a>
                <a href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA" class="cta-button">🗺️ Nawigacja</a>
            </div>', 
  '<div class="cta-section">
                <a href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA" class="cta-button">🗺️ Nawigacja</a>
            </div>'
)
WHERE name = 'reminder_2h';

-- Update the appointment confirmation template to remove contact button
UPDATE public.email_templates 
SET html_content = REPLACE(
  html_content, 
  '<div class="cta-section">
                <a href="tel:514902242" class="cta-button">📞 Kontakt</a>
                <a href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA" class="cta-button">🗺️ Dojazd</a>
            </div>', 
  '<div class="cta-section">
                <a href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA" class="cta-button">🗺️ Dojazd</a>
            </div>'
)
WHERE name = 'appointment_confirmation';