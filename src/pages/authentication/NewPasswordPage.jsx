import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import image from '@/assets/images/overcooked2.jpg';

import { z } from 'zod';
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

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const NewPasswordPage = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password', {
        email,
        newPassword: values.newPassword,
      });
      setLoading(false);
      setServerMsg(data.msg);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Password reset failed.';
      form.setError('root', { message: msg });
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>
            Make sure your new password is unique and hard to guess.{' '}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              {' '}
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button disabled={loading} type="submit" className="cursor-pointer w-full mt-4">
                <RotateCcw />
                Reset Password
              </Button>
              {form.formState.errors.root && (
                <p className="mt-3 text-sm text-red-500 text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
              {serverMsg && <p className="mt-3 text-sm text-green-600">{serverMsg}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPasswordPage;
