-- Add policy for admins to delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);