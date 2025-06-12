
-- Update email templates with beautiful, responsive designs

-- Update 24h reminder template
UPDATE public.email_templates 
SET 
  subject = 'Przypomnienie o wizycie jutro - {{patient_name}}',
  html_content = '<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Przypomnienie o wizycie</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Poppins", Arial, sans-serif; background: linear-gradient(135deg, #fef1f7 0%, #fff5f0 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f83c86 0%, #dcae30 100%); padding: 40px 30px; text-align: center; }
        .header h1 { font-family: "Playfair Display", serif; color: white; font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2d2d2d; margin-bottom: 20px; }
        .appointment-card { background: linear-gradient(135deg, #fef1f7 0%, #fff5f0 100%); border-radius: 15px; padding: 30px; margin: 25px 0; border-left: 4px solid #f83c86; }
        .appointment-title { font-family: "Playfair Display", serif; font-size: 24px; color: #f83c86; margin-bottom: 20px; font-weight: 600; }
        .detail-row { display: flex; margin-bottom: 12px; align-items: center; }
        .detail-icon { width: 20px; height: 20px; margin-right: 12px; color: #dcae30; }
        .detail-label { font-weight: 600; color: #2d2d2d; margin-right: 8px; min-width: 80px; }
        .detail-value { color: #555; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f83c86 0%, #dcae30 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; transition: transform 0.3s; }
        .notes-section { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 3px solid #dcae30; }
        .notes-title { font-weight: 600; color: #2d2d2d; margin-bottom: 10px; }
        .location-section { background: #fff; border: 1px solid #e9ecef; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .footer { background: #2d2d2d; color: white; padding: 30px; text-align: center; }
        .footer h3 { font-family: "Playfair Display", serif; color: #f83c86; margin-bottom: 15px; }
        .contact-info { margin-bottom: 20px; }
        .contact-info p { margin-bottom: 5px; font-size: 14px; }
        .social-links { margin-top: 20px; }
        .social-links a { color: #dcae30; text-decoration: none; margin: 0 10px; font-size: 14px; }
        @media (max-width: 600px) {
            .container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
            .appointment-card { padding: 20px; }
            .detail-row { flex-direction: column; align-items: flex-start; }
            .detail-label { margin-bottom: 4px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Zastrzyk Piękna</h1>
            <p>Medycyna Estetyczna & Kosmetologia</p>
        </div>
        
        <div class="content">
            <p class="greeting">Dzień dobry <strong>{{patient_name}}</strong>,</p>
            
            <p style="margin-bottom: 25px; color: #555; line-height: 1.6;">
                Przypominamy o zaplanowanej wizycie jutro. Poniżej znajdą Państwo wszystkie szczegóły:
            </p>
            
            <div class="appointment-card">
                <h2 class="appointment-title">Szczegóły wizyty</h2>
                
                <div class="detail-row">
                    <span class="detail-icon">🏥</span>
                    <span class="detail-label">Zabieg:</span>
                    <span class="detail-value">{{treatment_name}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-icon">📅</span>
                    <span class="detail-label">Data:</span>
                    <span class="detail-value">{{date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-icon">🕐</span>
                    <span class="detail-label">Godzina:</span>
                    <span class="detail-value">{{time}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-icon">⏱️</span>
                    <span class="detail-label">Czas trwania:</span>
                    <span class="detail-value">{{duration}} minut</span>
                </div>
            </div>
            
            {{#if pre_treatment_notes}}
            <div class="notes-section">
                <div class="notes-title">📋 Ważne informacje przed zabiegiem:</div>
                <p style="color: #555; line-height: 1.6;">{{pre_treatment_notes}}</p>
            </div>
            {{/if}}
            
            <div class="location-section">
                <h3 style="color: #f83c86; margin-bottom: 15px; font-family: Playfair Display, serif;">📍 Lokalizacja</h3>
                <p style="color: #555; margin-bottom: 8px;"><strong>Zastrzyk Piękna</strong></p>
                <p style="color: #777; font-size: 14px;">ul. Przykładowa 123, 00-000 Warszawa</p>
                <p style="color: #777; font-size: 14px;">Tel: +48 123 456 789</p>
            </div>
            
            <div class="cta-section">
                <a href="tel:+48123456789" class="cta-button">📞 Kontakt w razie pytań</a>
            </div>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
                Jeśli potrzebują Państwo zmienić termin wizyty, prosimy o kontakt telefoniczny przynajmniej 24 godziny wcześniej.
            </p>
        </div>
        
        <div class="footer">
            <h3>Zastrzyk Piękna</h3>
            <div class="contact-info">
                <p>ul. Przykładowa 123, 00-000 Warszawa</p>
                <p>Tel: +48 123 456 789 | Email: kontakt@zastrzykpiekna.pl</p>
                <p>www.zastrzykpiekna.pl</p>
            </div>
            <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Instagram</a> |
                <a href="#">LinkedIn</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2024 Zastrzyk Piękna. Wszystkie prawa zastrzeżone.
            </p>
        </div>
    </div>
</body>
</html>',
  text_content = 'Przypomnienie o wizycie - {{patient_name}}

Dzień dobry {{patient_name}},

Przypominamy o zaplanowanej wizycie jutro:

Zabieg: {{treatment_name}}
Data: {{date}}
Godzina: {{time}}
Czas trwania: {{duration}} minut

{{#if pre_treatment_notes}}
Ważne informacje przed zabiegiem:
{{pre_treatment_notes}}
{{/if}}

Lokalizacja:
Zastrzyk Piękna
ul. Przykładowa 123, 00-000 Warszawa
Tel: +48 123 456 789

W razie pytań prosimy o kontakt telefoniczny.

Pozdrawiamy,
Zespół Zastrzyk Piękna

---
www.zastrzykpiekna.pl
kontakt@zastrzykpiekna.pl'
WHERE name = 'reminder_24h';

-- Update 2h reminder template
UPDATE public.email_templates 
SET 
  subject = 'Przypomnienie o wizycie za 2 godziny - {{patient_name}}',
  html_content = '<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Przypomnienie o wizycie</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Poppins", Arial, sans-serif; background: linear-gradient(135deg, #fef1f7 0%, #fff5f0 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f83c86 0%, #e91f64 100%); padding: 30px; text-align: center; }
        .header h1 { font-family: "Playfair Display", serif; color: white; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300; }
        .urgent-banner { background: #ff6b35; color: white; padding: 15px; text-align: center; font-weight: 600; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; color: #2d2d2d; margin-bottom: 20px; }
        .appointment-summary { background: linear-gradient(135deg, #fff5f5 0%, #fef1f7 100%); border-radius: 15px; padding: 25px; margin: 20px 0; border: 2px solid #f83c86; text-align: center; }
        .appointment-time { font-family: "Playfair Display", serif; font-size: 36px; color: #f83c86; font-weight: 700; margin-bottom: 10px; }
        .appointment-treatment { font-size: 20px; color: #2d2d2d; font-weight: 600; margin-bottom: 15px; }
        .quick-info { display: flex; justify-content: space-around; margin: 20px 0; }
        .info-item { text-align: center; flex: 1; }
        .info-label { font-size: 12px; color: #777; text-transform: uppercase; margin-bottom: 5px; }
        .info-value { font-size: 16px; color: #2d2d2d; font-weight: 600; }
        .cta-section { text-align: center; margin: 25px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f83c86 0%, #dcae30 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0; }
        .location-quick { background: #f8f9fa; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: center; }
        .footer { background: #2d2d2d; color: white; padding: 25px; text-align: center; }
        .footer h3 { font-family: "Playfair Display", serif; color: #f83c86; margin-bottom: 10px; }
        @media (max-width: 600px) {
            .container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .appointment-time { font-size: 28px; }
            .quick-info { flex-direction: column; }
            .info-item { margin-bottom: 15px; }
            .cta-button { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="urgent-banner">
            ⏰ PRZYPOMNIENIE: Wizyta za 2 godziny!
        </div>
        
        <div class="header">
            <h1>Zastrzyk Piękna</h1>
            <p>Twoja wizyta już za chwilę</p>
        </div>
        
        <div class="content">
            <p class="greeting">Dzień dobry <strong>{{patient_name}}</strong>,</p>
            
            <p style="margin-bottom: 25px; color: #555; line-height: 1.6;">
                Przypominamy, że Państwa wizyta odbędzie się już <strong>za 2 godziny</strong>!
            </p>
            
            <div class="appointment-summary">
                <div class="appointment-time">{{time}}</div>
                <div class="appointment-treatment">{{treatment_name}}</div>
                
                <div class="quick-info">
                    <div class="info-item">
                        <div class="info-label">Data</div>
                        <div class="info-value">{{date}}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Czas trwania</div>
                        <div class="info-value">{{duration}} min</div>
                    </div>
                </div>
            </div>
            
            {{#if pre_treatment_notes}}
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 15px; margin: 20px 0;">
                <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">⚠️ Ostatnie przypomnienie:</div>
                <p style="color: #856404; font-size: 14px;">{{pre_treatment_notes}}</p>
            </div>
            {{/if}}
            
            <div class="location-quick">
                <h3 style="color: #f83c86; margin-bottom: 10px;">📍 Lokalizacja</h3>
                <p style="color: #2d2d2d; font-weight: 600;">ul. Przykładowa 123, 00-000 Warszawa</p>
                <p style="color: #777; font-size: 14px;">Tel: +48 123 456 789</p>
            </div>
            
            <div class="cta-section">
                <a href="tel:+48123456789" class="cta-button">📞 Zadzwoń</a>
                <a href="https://maps.google.com" class="cta-button">🗺️ Nawigacja</a>
            </div>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin-top: 20px; text-align: center;">
                Jeśli nie mogą Państwo dotrzeć na wizytę, prosimy o pilny kontakt telefoniczny.
            </p>
        </div>
        
        <div class="footer">
            <h3>Zastrzyk Piękna</h3>
            <p style="font-size: 14px;">Tel: +48 123 456 789 | kontakt@zastrzykpiekna.pl</p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
                Do zobaczenia za chwilę! 💖
            </p>
        </div>
    </div>
</body>
</html>',
  text_content = 'PRZYPOMNIENIE: Wizyta za 2 godziny!

Dzień dobry {{patient_name}},

Przypominamy, że Państwa wizyta odbędzie się już za 2 godziny!

{{treatment_name}}
{{date}} o {{time}}
Czas trwania: {{duration}} minut

{{#if pre_treatment_notes}}
Ostatnie przypomnienie:
{{pre_treatment_notes}}
{{/if}}

Lokalizacja:
ul. Przykładowa 123, 00-000 Warszawa
Tel: +48 123 456 789

W razie problemów prosimy o pilny kontakt.

Do zobaczenia za chwilę!
Zespół Zastrzyk Piękna'
WHERE name = 'reminder_2h';

-- Insert a new confirmation template if it doesn't exist
INSERT INTO public.email_templates (name, subject, html_content, text_content, template_type, is_active)
SELECT 
  'appointment_confirmation',
  'Potwierdzenie wizyty - {{patient_name}}',
  '<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Potwierdzenie wizyty</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Poppins", Arial, sans-serif; background: linear-gradient(135deg, #fef1f7 0%, #fff5f0 100%); }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dcae30 0%, #f83c86 100%); padding: 40px 30px; text-align: center; }
        .header h1 { font-family: "Playfair Display", serif; color: white; font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .header p { color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300; }
        .success-banner { background: #28a745; color: white; padding: 20px; text-align: center; font-weight: 600; font-size: 18px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #2d2d2d; margin-bottom: 20px; }
        .appointment-card { background: linear-gradient(135deg, #f0fff4 0%, #f8fff9 100%); border-radius: 15px; padding: 30px; margin: 25px 0; border: 2px solid #28a745; }
        .appointment-title { font-family: "Playfair Display", serif; font-size: 24px; color: #28a745; margin-bottom: 20px; font-weight: 600; text-align: center; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .detail-item { background: white; padding: 15px; border-radius: 10px; text-align: center; }
        .detail-label { font-size: 12px; color: #777; text-transform: uppercase; margin-bottom: 5px; }
        .detail-value { font-size: 16px; color: #2d2d2d; font-weight: 600; }
        .next-steps { background: #e3f2fd; border-radius: 15px; padding: 25px; margin: 25px 0; border-left: 4px solid #2196f3; }
        .next-steps h3 { color: #1976d2; margin-bottom: 15px; font-family: "Playfair Display", serif; }
        .step-list { list-style: none; }
        .step-list li { margin-bottom: 10px; padding-left: 25px; position: relative; color: #555; }
        .step-list li:before { content: "✓"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 0 10px 10px 0; }
        .contact-card { background: #f8f9fa; border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center; }
        .footer { background: #2d2d2d; color: white; padding: 30px; text-align: center; }
        .footer h3 { font-family: "Playfair Display", serif; color: #dcae30; margin-bottom: 15px; }
        @media (max-width: 600px) {
            .container { margin: 0 10px; }
            .header, .content, .footer { padding: 20px; }
            .detail-grid { grid-template-columns: 1fr; }
            .cta-button { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-banner">
            ✅ Wizyta została pomyślnie zarezerwowana!
        </div>
        
        <div class="header">
            <h1>Zastrzyk Piękna</h1>
            <p>Potwierdzenie rezerwacji</p>
        </div>
        
        <div class="content">
            <p class="greeting">Dzień dobry <strong>{{patient_name}}</strong>,</p>
            
            <p style="margin-bottom: 25px; color: #555; line-height: 1.6;">
                Dziękujemy za zaufanie! Poniżej znajdują się szczegóły Państwa wizyty:
            </p>
            
            <div class="appointment-card">
                <h2 class="appointment-title">🎉 Wizyta potwierdzona</h2>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Zabieg</div>
                        <div class="detail-value">{{treatment_name}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Data</div>
                        <div class="detail-value">{{date}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Godzina</div>
                        <div class="detail-value">{{time}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Czas trwania</div>
                        <div class="detail-value">{{duration}} min</div>
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>📋 Co dalej?</h3>
                <ul class="step-list">
                    <li>Otrzymają Państwo przypomnienia 24h oraz 2h przed wizytą</li>
                    <li>W razie pytań prosimy o kontakt telefoniczny</li>
                    <li>Punktualność jest bardzo ważna dla komfortu wszystkich pacjentów</li>
                    <li>W przypadku konieczności odwołania - min. 24h wcześniej</li>
                </ul>
            </div>
            
            {{#if pre_treatment_notes}}
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 15px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #856404; margin-bottom: 10px;">📝 Przygotowanie do zabiegu:</h3>
                <p style="color: #856404; line-height: 1.6;">{{pre_treatment_notes}}</p>
            </div>
            {{/if}}
            
            <div class="contact-card">
                <h3 style="color: #f83c86; margin-bottom: 15px; font-family: Playfair Display, serif;">📍 Gdzie nas znajdą Państwo?</h3>
                <p style="color: #2d2d2d; font-weight: 600; margin-bottom: 8px;">Zastrzyk Piękna</p>
                <p style="color: #777;">ul. Przykładowa 123, 00-000 Warszawa</p>
                <p style="color: #777;">Tel: +48 123 456 789</p>
                <p style="color: #777; margin-top: 10px;">Poniedziałek - Piątek: 9:00 - 18:00</p>
            </div>
            
            <div class="cta-section">
                <a href="tel:+48123456789" class="cta-button">📞 Kontakt</a>
                <a href="https://maps.google.com" class="cta-button">🗺️ Dojazd</a>
            </div>
            
            <p style="color: #777; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
                Cieszymy się na spotkanie! W razie jakichkolwiek pytań jesteśmy do Państwa dyspozycji.
            </p>
        </div>
        
        <div class="footer">
            <h3>Zastrzyk Piękna</h3>
            <div style="margin-bottom: 20px;">
                <p>ul. Przykładowa 123, 00-000 Warszawa</p>
                <p>Tel: +48 123 456 789 | Email: kontakt@zastrzykpiekna.pl</p>
                <p>www.zastrzykpiekna.pl</p>
            </div>
            <div style="margin: 20px 0;">
                <a href="#" style="color: #dcae30; text-decoration: none; margin: 0 10px;">Facebook</a> |
                <a href="#" style="color: #dcae30; text-decoration: none; margin: 0 10px;">Instagram</a> |
                <a href="#" style="color: #dcae30; text-decoration: none; margin: 0 10px;">LinkedIn</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                © 2024 Zastrzyk Piękna. Wszystkie prawa zastrzeżone.
            </p>
        </div>
    </div>
</body>
</html>',
  'Potwierdzenie wizyty - {{patient_name}}

Dzień dobry {{patient_name}},

Dziękujemy za zaufanie! Państwa wizyta została potwierdzona:

Zabieg: {{treatment_name}}
Data: {{date}}
Godzina: {{time}}
Czas trwania: {{duration}} minut

{{#if pre_treatment_notes}}
Przygotowanie do zabiegu:
{{pre_treatment_notes}}
{{/if}}

Lokalizacja:
Zastrzyk Piękna
ul. Przykładowa 123, 00-000 Warszawa
Tel: +48 123 456 789
Godziny pracy: Pon-Pt 9:00-18:00

Co dalej?
• Otrzymają Państwo przypomnienia przed wizytą
• W razie pytań prosimy o kontakt
• Punktualność jest bardzo ważna
• Odwołanie - min. 24h wcześniej

Cieszymy się na spotkanie!

Pozdrawiamy,
Zespół Zastrzyk Piękna

---
www.zastrzykpiekna.pl
kontakt@zastrzykpiekna.pl',
  'confirmation',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates WHERE name = 'appointment_confirmation'
);
