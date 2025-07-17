-- Update Google Maps links in email templates to point to Jaworzno address

-- Update the 24h reminder template
UPDATE public.email_templates 
SET html_content = REPLACE(html_content, 
  'href="https://maps.google.com"',
  'href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA"'
)
WHERE name = 'reminder_24h';

-- Update the 2h reminder template
UPDATE public.email_templates 
SET html_content = REPLACE(html_content, 
  'href="https://maps.google.com"',
  'href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA"'
)
WHERE name = 'reminder_2h';

-- Update the appointment confirmation template
UPDATE public.email_templates 
SET html_content = REPLACE(html_content, 
  'href="https://maps.google.com"',
  'href="https://maps.app.goo.gl/kc3fHsaDQgefoS8fA"'
)
WHERE name = 'appointment_confirmation';