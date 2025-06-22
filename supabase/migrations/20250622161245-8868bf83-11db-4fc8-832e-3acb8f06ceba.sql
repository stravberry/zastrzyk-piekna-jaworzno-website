
-- Usuń wszystkie aktywne blokady
DELETE FROM public.security_blocks;

-- Usuń wszystkie rate limits dla contact form
DELETE FROM public.rate_limits WHERE action LIKE '%contact%';

-- Wyczyść wszystkie rate limits starsze niż godzina (cleanup)
DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
