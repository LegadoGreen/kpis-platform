import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password }); // Handle login logic
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white p-6 rounded shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>
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
