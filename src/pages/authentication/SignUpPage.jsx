// src/pages/SignUpPage.jsx
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '@/assets/images/overcooked5.jpg';
import logo from '@/assets/images/Recipedia-logo-square.svg';
import { CookingPot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// --- Schema ---
const SignUpFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name'),
    email: z.string().trim().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Recipedia | Sign Up';
  }, []);
  const form = useForm({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const { data } = await api.post('/auth/signup', {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setLoading(false);

      if (data.msg?.toLowerCase().includes('verification code')) {
        navigate(`/verify-code?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err) {
      setLoading(false);

      const msg = err?.response?.data?.msg || 'Something went wrong';
      if (msg.toLowerCase().includes('user already exists')) {
        form.setError('email', {
          message: 'This email is already registered.',
        });
      } else if (msg.toLowerCase().includes('password')) {
        form.setError('password', { message: msg });
      } else {
        form.setError('root', { message: msg });
      }
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${loginImage})` }}
      className="bg-cover bg-center flex min-h-svh flex-col items-center md:items-start justify-center gap-6 p-4 md:p-10"
    >
      <div className="flex w-full mx-0 md:mx-18 lg:mx-18 max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <Link to={'/'} className="flex items-center gap-2 self-center font-medium mb-2">
                <img src={logo} alt="Recipedia Logo" className="h-9" />
                Recipedia
              </Link>
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>Join the feast.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off">
                  <div className="grid gap-6">
                    <div className="grid gap-6">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jamie Oliver" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="example@recipedia.com"
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Password */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••••••••"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Confirm Password */}
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Re-enter Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••••••••"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      disabled={loading}
                      type="submit"
                      variant="default"
                      className={`w-full cursor-pointer ${loading ? 'opacity-60' : ''}`}
                    >
                      <CookingPot />
                      {loading ? 'Creating...' : 'Create account!'}
                    </Button>

                    <div className="text-center text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                        Log in
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* <div className="text-white *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By signing up, you agree to our <a>Terms of Service</a> and{" "}
            <a>Privacy Policy</a>.
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
