import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CookingPot } from "lucide-react";
import logo from "../assets/images/Recipedia-logo-square.svg";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
          <form>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@recipedia.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••••••"
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
                <a
                  href="#"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Join the feast
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a>Terms of Service</a> and{" "}
        <a>Privacy Policy</a>.
      </div>
    </div>
  );
}
