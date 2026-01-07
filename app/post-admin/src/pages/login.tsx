import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, Card, Input, Form, FormItem } from "../components/ui";
import { useAuth } from "../hooks/use-auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [token, setToken] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter a token");
      return;
    }
    login(token.trim());
    toast.success("Logged in successfully");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-neutral-900">
          Post Admin
        </h1>
        <Form onSubmit={handleSubmit}>
          <FormItem label="Auth Token" required>
            <Input
              type="password"
              icon={<Lock className="h-4 w-4" />}
              placeholder="Enter your auth token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </FormItem>
          <Button type="submit" variant="primary" size="lg" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
