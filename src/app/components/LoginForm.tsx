import React, { useState } from "react";
import { useAuthActions } from "../hooks/useAuth";
import Input from "./Input";
import Button from "./Button";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      // Redirect to user dashboard or admin screen
      console.log("Login successful");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white p-6 rounded shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        className="mt-4"
      />
      <Button type="submit" className="mt-6 w-full">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
