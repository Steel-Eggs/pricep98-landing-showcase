-- Create table for storing all form submissions
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('callback', 'order', 'promo')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_name TEXT,
  configuration JSONB,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view submissions
CREATE POLICY "Admins can view all submissions"
ON public.submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Only admins can update submissions
CREATE POLICY "Admins can update submissions"
ON public.submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Anyone can insert submissions (public form)
CREATE POLICY "Anyone can create submissions"
ON public.submissions
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_type ON public.submissions(type);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);