import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    school: "",
    grade: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    registerMutation.mutate({ data: formData }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        setErrorMsg(err.message || "Registration failed. Please check your inputs.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
        <div className="bg-primary text-primary-foreground p-2 rounded-xl">
          <Leaf className="w-8 h-8" />
        </div>
        <span className="font-extrabold text-3xl text-primary tracking-tight">EcoLearn</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Start your journey</CardTitle>
          <CardDescription>Create an account to start earning eco-points</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-semibold text-center">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Alex Green" value={formData.name} onChange={handleChange} required minLength={2}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@school.edu" value={formData.email} onChange={handleChange} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={6}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input id="school" placeholder="Earth High" value={formData.school} onChange={handleChange} required/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade (Optional)</Label>
                <Input id="grade" placeholder="10th" value={formData.grade} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg h-12" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => setLocation("/login")}>Log in</span>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
