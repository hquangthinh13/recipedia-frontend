import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import logo from "../assets/images/Recipedia-logo-square.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const VerifyCodePage = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const { login } = useAuth();

  // --- Verify the code ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/verify-code", { email, code });
      setMessage(data.msg);

      if (data.token) {
        // ✅ Auto login using the AuthContext
        await login(data.token);
        setMessage("Account verified! Logging you in...");
        setTimeout(() => navigate("/customize-avatar"), 1500);
      } else {
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      const msg = err?.response?.data?.msg || "Verification failed";
      setMessage(msg);
    }
  };

  // --- Resend the code ---
  const handleResend = async () => {
    setResending(true);
    try {
      const { data } = await api.post("/auth/resend-code", { email });
      setMessage(data.msg);
    } catch (err) {
      const msg = err?.response?.data?.msg || "Failed to resend code";
      setMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <Card className="p-6 max-w-md text-center">
        <CardHeader>
          {/* <a className="flex items-center gap-2 self-center font-medium mb-6"> */}
          <Link
            to={`/`}
            className="flex items-center gap-2 self-center font-medium mb-6"
          >
            <img src={logo} alt="Recipedia Logo" className="h-9" />
            Recipedia
          </Link>
          {/* </a>{" "} */}
          <CardTitle>Enter Your Verification Code</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            We sent a 6-digit code to{" "}
            <strong className="text-primary">{email}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mb-4 text-center tracking-wide"
              maxLength={6}
            />
            <div className="mb-4 text-[var(--muted-foreground)]">
              <p className="text-xs">
                Sometimes our verification email lands in your
                <strong> Spam or Trash </strong>
                folder. Please check there — and mark it as “Not spam” so you
                don’t miss future updates!
              </p>
            </div>
            <Button type="submit" className="cursor-pointer w-full">
              <Check />
              Verify
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending}
              className="w-full cursor-pointer"
            >
              <RotateCcw />
              {resending ? "Resending..." : "Resend Code"}
            </Button>
          </div>

          {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCodePage;
