-- Add file attachment columns to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_path text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_size integer;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type text;