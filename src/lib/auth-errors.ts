import {AuthApiError} from '@supabase/supabase-js';
export function authErrorMessage(error:unknown){
  if(error instanceof AuthApiError){
    if(error.code==='invalid_credentials')return 'Email or password is incorrect. Please try again.';
    if(error.code==='email_not_confirmed')return 'Please confirm your email before signing in. Check your inbox or request another confirmation email.';
    if(error.status===429)return 'Too many requests. Please wait a little before trying again.';
    if(error.code==='otp_expired')return 'This verification code has expired or is invalid. Request a new email and use the latest code.';
  }
  const message=error instanceof Error?error.message:'Something went wrong. Please try again.';
  if(/provider.*not enabled|unsupported provider/i.test(message))return 'This social sign-in method is not configured yet. Please use email and password.';
  if(/failed to fetch|network|load failed/i.test(message))return 'Could not connect. Check your connection and try again.';
  return message;
}
