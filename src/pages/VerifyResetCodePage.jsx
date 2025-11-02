import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import logo from "@/assets/images/Recipedia-logo-square.svg";
import { Check } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z.object({
  code: z.string().min(6, "Enter your 6-digit code"),
});

const VerifyResetCodePage = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/verify-reset-code", {
        email,
        ...values,
      });
      setServerMsg(data.msg);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.msg || "Invalid or expired code.";
      form.setError("code", { message: msg });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <Card className="max-w-md w-full">
        <CardHeader>
          <Link to={`/`} className="flex items-center gap-2 font-medium mb-6">
            <img src={logo} alt="Recipedia Logo" className="h-9" />
            Recipedia
          </Link>
          <CardTitle>Verify Your Reset Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <p className="mb-4 text-sm text-gray-600">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="cursor-pointer w-full mt-4">
                <Check />
                Verify Code
              </Button>

              {serverMsg && (
                <p className="mt-3 text-sm text-green-600">{serverMsg}</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyResetCodePage;
