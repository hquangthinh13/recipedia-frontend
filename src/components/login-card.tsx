import React from "react";
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

export default function LoginCard({ onSubmit }) {
  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <a className="flex items-center gap-2 self-center font-medium mb-6">
          <img src={logo} alt="Recipedia Logo" className="h-9" />
          Recipedia
        </a>
        <CardTitle className="text-xl">
          {" "}
          Welcome back to the kitchen, Chef!
        </CardTitle>
        <CardDescription>Your recipes await.</CardDescription>
      </CardHeader>
      <CardContent>
        {" "}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@recipedia.com"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            to="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>{" "}
                        </div>
                        <FormControl>
                          <Input placeholder="••••••••••••••" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full cursor-pointer transition ease-in-out delay-150 duration-300 hover:scale-105 not-odd:hover:-translate-y-0.5"
                >
                  <CookingPot />
                  Let’s cook!
                </Button>
              </div>
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
          </form>{" "}
        </Form>
      </CardContent>
    </Card>
  );
}
