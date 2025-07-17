-- Make requested changes to email templates

-- 1. Update default pre_treatment_notes in EmailTestingPanel component
UPDATE public.email_templates 
SET html_content = REPLACE(
  html_content,
  '<div class="detail-grid">',
  '<div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0;">'
)
WHERE name = 'appointment_confirmation';

-- 2. Update the detail-item styles to add more padding and margin
UPDATE public.email_templates 
SET html_content = REPLACE(
  html_content,
  '<div class="detail-item">',
  '<div class="detail-item" style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 15px;">'
)
WHERE name = 'appointment_confirmation';

-- 3. Update the default pre-treatment notes in all templates to the requested text
UPDATE public.email_templates
SET html_content = REPLACE(
  html_content,
  'Prosimy o nieużywanie kremów 24h przed zabiegiem',
  'Prosimy o wyspanie się przed zabiegiem'
)
WHERE name IN ('reminder_24h', 'reminder_2h', 'appointment_confirmation');

-- 4. Also update the EmailTestingPanel default value for pre-treatment notes
UPDATE public.email_templates
SET html_content = REPLACE(
  html_content,
  'Prosimy o nieużywanie kremów przed zabiegiem',
  'Prosimy o wyspanie się przed zabiegiem'
)
WHERE name IN ('reminder_24h', 'reminder_2h', 'appointment_confirmation');