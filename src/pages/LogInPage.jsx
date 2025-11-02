import React, { useEffect } from "react";
import api from "../lib/api";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { LoginFormSchema } from "../formSchema/loginFormSchema"; // schema
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginImage from "../assets/images/overcooked2.jpg";
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
  const [showPassword, setShowPassword] = useState(false);

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
      const { data } = await api.post("/auth/login", values);
      if (data.token) {
        // Call the AuthContext login, which fetches user and updates Navbar
        await login(data.token);
        navigate("/");
      }
    } catch (error) {
      const msg =
        error.response?.data?.msg || "Unable to log in. Please try again.";

      if (msg.toLowerCase().includes("user does not exist")) {
        form.setError("email", {
          message: "No account found with this email.",
        });
      } else if (
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("password")
      ) {
        form.setError("password", {
          message: "Incorrect password. Please try again.",
        });
      } else if (msg.toLowerCase().includes("verify")) {
        form.setError("email", {
          message: "Please verify your email before logging in.",
        });
      } else {
        form.setError("root", { message: msg });
      }
    }
    return false;
  };
  useEffect(() => {
    document.title = "Recipedia | Log In";
  }, []);
  return (
    <div
      style={{ backgroundImage: `url(${loginImage})` }}
      className="bg-cover bg-center flex min-h-svh flex-col items-center md:items-start  justify-center gap-6 p-6 md:p-10"
    >
      <div className="flex w-full mx-0 md:mx-18 lg:mx-18 max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <Link
                to={"/"}
                className="cursor-pointer flex items-center gap-2 self-center font-medium mb-6"
              >
                <img src={logo} alt="Recipedia Logo" className="h-9" />
                Recipedia
              </Link>
              <CardTitle className="text-xl">
                {" "}
                Welcome back to the kitchen, Chef!
              </CardTitle>
              <CardDescription>Your recipes await.</CardDescription>
            </CardHeader>
            <CardContent>
              {" "}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  noValidate
                  autoComplete="off"
                >
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
                                  to={`/change-password`}
                                  className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                  Forgot your password?
                                </Link>
                              </div>{" "}
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••••••••"
                                    {...field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="default"
                        className="w-full cursor-pointer"
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
          {/* <div className="text-white *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a>Terms of Service</a> and{" "}
            <a>Privacy Policy</a>.
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
