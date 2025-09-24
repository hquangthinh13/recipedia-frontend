import React from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { LoginFormSchema } from "../formSchema/loginFormSchema"; // schema
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginImage from "../assets/images/image0.jpg";
import logo from "../assets/images/Recipedia-logo-square.svg";
import { CookingPot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (values) => {
    console.log("Content:", values);
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/login",
        values
      );
      if (data.token) {
        // Call the AuthContext login, which fetches user and updates Navbar
        await login(data.token);
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  return (
    <div
      style={{ backgroundImage: `url(${loginImage})` }}
      className="bg-cover bg-center flex min-h-svh flex-col items-center md:items-end lg:items-end justify-center gap-6 p-6 md:p-10"
    >
      <div className="flex w-full mx-0 md:mx-18 lg:mx-18 max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
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
                          type="password"
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
                                <Input
                                  placeholder="••••••••••••••"
                                  {...field}
                                />
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
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a>Terms of Service</a> and{" "}
            <a>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
