-- Update contact information in all email templates

-- Update the 24h reminder template
UPDATE public.email_templates 
SET html_content = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(html_content, 
                    'ul. Przykładowa 123, 00-000 Warszawa',
                    'Grunwaldzka 106<br>43-600 Jaworzno<br>woj. śląskie'
                  ),
                  'Tel: +48 123 456 789',
                  'Tel: 514 902 242'
                ),
                'kontakt@zastrzykpiekna.pl',
                'zastrzykpiekna.kontakt@gmail.com'
              ),
              'href="tel:+48123456789"',
              'href="tel:514902242"'
            ),
            'Poniedziałek - Piątek: 9:00 - 18:00',
            'Czynne całą dobę'
          ),
          'Facebook</a> |',
          'Instagram @zastrzyk_piekna</a> |'
        ),
        'Instagram</a> |',
        'Instagram @zastrzyk_piekna</a> |'
      ),
      'LinkedIn</a>',
      'Email zastrzykpiekna.kontakt@gmail.com</a>'
    ),
    'www.zastrzykpiekna.pl',
    'Instagram: @zastrzyk_piekna'
  ),
  '<p style="color: #777; font-size: 14px;">Tel: +48 123 456 789</p>',
  '<p style="color: #777; font-size: 14px;">Tel: 514 902 242</p>'
)
WHERE name = 'reminder_24h';

-- Update the 2h reminder template
UPDATE public.email_templates 
SET html_content = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(html_content, 
                  'ul. Przykładowa 123, 00-000 Warszawa',
                  'Grunwaldzka 106<br>43-600 Jaworzno<br>woj. śląskie'
                ),
                'Tel: +48 123 456 789',
                'Tel: 514 902 242'
              ),
              'kontakt@zastrzykpiekna.pl',
              'zastrzykpiekna.kontakt@gmail.com'
            ),
            'href="tel:+48123456789"',
            'href="tel:514902242"'
          ),
          'Tel: +48 123 456 789 | kontakt@zastrzykpiekna.pl',
          'Tel: 514 902 242 | zastrzykpiekna.kontakt@gmail.com'
        ),
        '<p style="color: #2d2d2d; font-weight: 600;">ul. Przykładowa 123, 00-000 Warszawa</p>',
        '<p style="color: #2d2d2d; font-weight: 600;">Grunwaldzka 106<br>43-600 Jaworzno<br>woj. śląskie</p>'
      ),
      '<p style="color: #777; font-size: 14px;">Tel: +48 123 456 789</p>',
      '<p style="color: #777; font-size: 14px;">Tel: 514 902 242</p>'
    ),
    'Do zobaczenia za chwilę! 💖',
    'Instagram: @zastrzyk_piekna 💖'
  ),
  'Tel: +48 123 456 789 | kontakt@zastrzykpiekna.pl',
  'Tel: 514 902 242 | zastrzykpiekna.kontakt@gmail.com'
)
WHERE name = 'reminder_2h';

-- Update the appointment confirmation template
UPDATE public.email_templates 
SET html_content = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(html_content, 
                      'ul. Przykładowa 123, 00-000 Warszawa',
                      'Grunwaldzka 106<br>43-600 Jaworzno<br>woj. śląskie'
                    ),
                    'Tel: +48 123 456 789',
                    'Tel: 514 902 242'
                  ),
                  'kontakt@zastrzykpiekna.pl',
                  'zastrzykpiekna.kontakt@gmail.com'
                ),
                'href="tel:+48123456789"',
                'href="tel:514902242"'
              ),
              'Poniedziałek - Piątek: 9:00 - 18:00',
              'Czynne całą dobę'
            ),
            'Facebook</a> |',
            'Instagram @zastrzyk_piekna</a> |'
          ),
          'Instagram</a> |',
          'Instagram @zastrzyk_piekna</a> |'
        ),
        'LinkedIn</a>',
        'Email zastrzykpiekna.kontakt@gmail.com</a>'
      ),
      'www.zastrzykpiekna.pl',
      'Instagram: @zastrzyk_piekna'
    ),
    '<p style="color: #777;">Tel: +48 123 456 789</p>',
    '<p style="color: #777;">Tel: 514 902 242</p>'
  ),
  'Tel: +48 123 456 789 | Email: kontakt@zastrzykpiekna.pl',
  'Tel: 514 902 242 | Email: zastrzykpiekna.kontakt@gmail.com'
)
WHERE name = 'appointment_confirmation';