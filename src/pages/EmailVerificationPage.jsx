import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await api.get(`/auth/verify/${token}`);
        setMessage("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } catch {
        setMessage("Invalid or expired verification link.");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="p-6 max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{message}</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
