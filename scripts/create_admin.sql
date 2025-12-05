-- Replace 'YOUR_EMAIL_HERE' with the email address of the user you want to make an admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'blackswordman585@gmail.com';

-- Verify the change
SELECT email, is_admin FROM public.profiles WHERE is_admin = true;
