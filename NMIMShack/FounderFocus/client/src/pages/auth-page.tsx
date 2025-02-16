import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Solo Founder AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      {...loginForm.register("username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) =>
                    registerMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      {...registerForm.register("username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-1 bg-[#2D46B9] text-white p-12 items-center justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">
            Your AI-Powered Solo Founder Journey Starts Here
          </h1>
          <p className="text-lg opacity-90">
            Get strategic guidance, validate your ideas, and build your startup with
            AI-powered insights and tools designed specifically for solo founders.
          </p>
        </div>
      </div>
    </div>
  );
}
