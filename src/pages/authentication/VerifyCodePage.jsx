import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw } from 'lucide-react';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Image from '@/assets/images/overcooked2.jpg';
const schema = z.object({
  code: z.string().min(6, 'Enter your 6-digit code'),
});
const VerifyCodePage = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });
  // --- Verify the code ---
  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/verify-code', {
        email,
        code: values.code, // ✅ use form value
      });
      setLoading(false);

      setMessage(data.msg);

      if (data.token) {
        await login(data.token);
        setMessage('Account verified! Logging you in...');
        setTimeout(() => navigate('/customize-avatar'), 1500);
      } else {
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.msg || 'Verification failed';
      setMessage(msg);
    }
  };

  // --- Resend the code ---
  const handleResend = async () => {
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-code', { email });
      setMessage(data.msg);
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Failed to resend code';
      setMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${Image})` }}
      className="flex min-h-screen p-4 items-center justify-center bg-primary"
    >
      <Card className="p-6 max-w-md text-center">
        <CardHeader>
          <Link to={`/`} className="flex items-center gap-2 self-center font-medium mb-6">
            <img src={logo} alt="Recipedia Logo" className="h-9" />
            Recipedia
          </Link>
          <CardTitle>Enter Your Verification Code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        className="mb-2"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>

                    <FormDescription className="text-[var(--muted-foreground)] text-xs text-center">
                      Sometimes our verification email lands in your
                      <strong> Spam or Trash </strong>
                      folder. Please check there — and mark it as “Not spam” so you don’t miss
                      future updates!
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={loading}
                type="submit"
                className={`w-full cursor-pointer ${loading ? 'opacity-60' : ''}`}
              >
                <Check />
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending}
                className={`w-full cursor-pointer ${resending ? 'opacity-60' : ''}`}
              >
                <RotateCcw />
                {resending ? 'Resending...' : 'Resend Code'}
              </Button>
              {message && <p className="text-sm text-green-600 text-center">{message}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCodePage;
