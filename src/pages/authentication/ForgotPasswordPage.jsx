import React, { use, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import image from '@/assets/images/overcooked2.jpg';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Send } from 'lucide-react';
import logo from '@/assets/images/Recipedia-logo-square.svg';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/request-password-reset', values);
      setLoading(false);
      setServerMsg(data.msg);
      setTimeout(() => {
        navigate(`/verify-reset-code?email=${encodeURIComponent(values.email)}`);
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Something went wrong.';
      form.setError('email', { message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Recipedia | Reset Password';
  }, []);

  return (
    <div
      style={{ backgroundImage: `url(${image})` }}
      className="flex min-h-screen p-4 items-center justify-center bg-primary"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Link
            to={`/`}
            className="cursor-pointer flex items-center gap-2 self-center font-medium mb-6"
          >
            <img src={logo} alt="Recipedia Logo" className="h-9" />
            Recipedia
          </Link>
          <CardTitle className="text-xl">Change your Password?</CardTitle>
          <CardDescription>
            Enter your email and we’ll send you a verification code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" placeholder="example@recipedia.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={loading} type="submit" className="cursor-pointer w-full mt-4">
                <Send />
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}{' '}
              </Button>

              {serverMsg && <p className="mt-3 text-sm text-green-600">{serverMsg}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
