import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import Input from "./Input";
import Button from "./Button";
import Image from "next/image";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, router);
      console.log("Login successful");
    } catch (err) {
      setError("Invalid email or password");
      console.error("Error logging in:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white p-6 rounded shadow-md">
      <Image src="/logo_legado.png" alt="Logo" width={1000} height={1000} className="w-24 mx-auto" />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <Input
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ingresa tu correo"
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Ingresa tu contrasena"
        className="mt-4"
      />
      <Button type="submit" className="mt-6 bg-legadoBrown text-white w-full hover:bg-orange-950">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
