import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormSchema } from "../formSchema/loginFormSchema";
import logo from "../assets/images/Recipedia-logo-square.svg";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CookingPot } from "lucide-react";

const LoginCard = forwardRef(({ onSubmit }, ref) => {
  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  // Expose form methods to parent (for setError)
  useImperativeHandle(ref, () => form);

  return (
    <Card>
      <CardHeader className="text-center">
        <a className="flex items-center gap-2 self-center font-medium mb-6">
          <img src={logo} alt="Recipedia Logo" className="h-9" />
          Recipedia
        </a>
        <CardTitle className="text-xl">
          Welcome back to the kitchen, Chef!
        </CardTitle>
        <CardDescription>Your recipes await.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder="example@recipedia.com"
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
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full cursor-pointer"
                >
                  <CookingPot className="" />
                  Let’s cook!
                </Button>

                {/* Inline root error */}
                {form.formState.errors.root && (
                  <p className="text-center text-sm text-red-500">
                    {form.formState.errors.root.message}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-sm">
                First time in the kitchen?{" "}
                <Link
                  to="/signup"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Join the feast
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
});

export default LoginCard;
