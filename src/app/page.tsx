"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Estados de controle
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Para alteração de senha
  const [changeEmail, setChangeEmail] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");

  const [message, setMessage] = useState("");

  // Registro
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const text = await response.text();
    setMessage(text);

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setShowRegister(false);
  }

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setMessage(data.message || "Senha incorreta.");
      }
    } catch {
      setMessage("Erro ao fazer login.");
    }
  }

  // Alterar senha (sem token, só email + nova senha)
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: changeEmail,
        newPassword: changeNewPassword,
      }),
    });

    const text = await response.text();

    if (response.ok) {
      setMessage("Senha atualizada com sucesso!");
      setChangeEmail("");
      setChangeNewPassword("");
      setShowChangePassword(false);
    } else {
      setMessage(text || "Erro ao atualizar a senha.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">doadev</h1>

      {message && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
          {message}
        </div>
      )}

      {!showRegister && !showChangePassword && (
        <>
          {/* Login */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Senha"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600"
              >
                Entrar
              </button>
            </form>
          </section>

          <button
            onClick={() => {
              setShowRegister(true);
              setMessage("");
            }}
            className="text-sm text-blue-600 hover:underline mb-2"
          >
            Não tem uma conta? Registrar-se
          </button>

          <button
            onClick={() => {
              setShowChangePassword(true);
              setMessage("");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Alterar senha
          </button>
        </>
      )}

      {/* Registro */}
      {showRegister && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Registrar</h2>
            <form onSubmit={handleRegister} className="flex flex-col">
              <input
                type="text"
                placeholder="Nome"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Senha"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600"
              >
                Registrar
              </button>
            </form>
          </section>

          <button
            onClick={() => setShowRegister(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Já tem uma conta? Fazer login
          </button>
        </>
      )}

      {/* Alterar senha */}
      {showChangePassword && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Alterar Senha</h2>
            <form onSubmit={handleChangePassword} className="flex flex-col">
              <input
                type="email"
                placeholder="Email"
                value={changeEmail}
                onChange={(e) => setChangeEmail(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={changeNewPassword}
                onChange={(e) => setChangeNewPassword(e.target.value)}
                required
                className="mb-2 p-2 border rounded"
              />
              <button
                type="submit"
                className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600"
              >
                Atualizar Senha
              </button>
            </form>
          </section>

          <button
            onClick={() => setShowChangePassword(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar
          </button>
        </>
      )}
    </div>
  );
}