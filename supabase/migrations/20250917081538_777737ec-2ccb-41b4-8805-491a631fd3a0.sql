-- Create pricing_treatment_map table to link pricing items with treatments
CREATE TABLE IF NOT EXISTS public.pricing_treatment_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_category_id TEXT NOT NULL,
    pricing_item_name TEXT NOT NULL,
    treatment_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(pricing_category_id, pricing_item_name)
);

-- Enable RLS
ALTER TABLE public.pricing_treatment_map ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage pricing treatment mapping"
ON public.pricing_treatment_map
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create function to get or create treatment for pricing item
CREATE OR REPLACE FUNCTION public.get_or_create_treatment_for_pricing_item(
    _category_id TEXT,
    _item_name TEXT,
    _item_description TEXT DEFAULT NULL,
    _item_price NUMERIC DEFAULT NULL,
    _duration_minutes INTEGER DEFAULT 60
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    existing_treatment_id UUID;
    new_treatment_id UUID;
    category_title TEXT;
BEGIN
    -- Get category title for treatment category
    SELECT title INTO category_title
    FROM public.pricing_categories
    WHERE id = _category_id;
    
    -- Check if mapping already exists
    SELECT treatment_id INTO existing_treatment_id
    FROM public.pricing_treatment_map
    WHERE pricing_category_id = _category_id 
    AND pricing_item_name = _item_name;
    
    -- If mapping exists, return existing treatment
    IF existing_treatment_id IS NOT NULL THEN
        RETURN existing_treatment_id;
    END IF;
    
    -- Create new treatment
    INSERT INTO public.treatments (
        name,
        category,
        description,
        price,
        duration_minutes,
        is_active
    ) VALUES (
        _item_name,
        COALESCE(category_title, 'Inne'),
        _item_description,
        _item_price,
        _duration_minutes,
        true
    ) RETURNING id INTO new_treatment_id;
    
    -- Create mapping
    INSERT INTO public.pricing_treatment_map (
        pricing_category_id,
        pricing_item_name,
        treatment_id
    ) VALUES (
        _category_id,
        _item_name,
        new_treatment_id
    );
    
    RETURN new_treatment_id;
END;
$$;

-- Create function to get available treatments from pricing
CREATE OR REPLACE FUNCTION public.get_available_treatments_from_pricing()
RETURNS TABLE(
    treatment_id UUID,
    name TEXT,
    category TEXT,
    description TEXT,
    price NUMERIC,
    duration_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    RETURN QUERY
    WITH pricing_items AS (
        SELECT 
            pc.id as category_id,
            pc.title as category_title,
            item->>'name' as item_name,
            item->>'description' as item_description,
            CASE 
                WHEN item->>'price' IS NOT NULL THEN 
                    CAST(REGEXP_REPLACE(item->>'price', '[^\d.]', '', 'g') AS NUMERIC)
                ELSE NULL 
            END as item_price
        FROM public.pricing_categories pc,
        JSONB_ARRAY_ELEMENTS(pc.items) as item
    )
    SELECT 
        public.get_or_create_treatment_for_pricing_item(
            pi.category_id,
            pi.item_name,
            pi.item_description,
            pi.item_price,
            60
        ) as treatment_id,
        pi.item_name as name,
        pi.category_title as category,
        pi.item_description as description,
        pi.item_price as price,
        60 as duration_minutes
    FROM pricing_items pi
    ORDER BY pi.category_title, pi.item_name;
END;
$$;