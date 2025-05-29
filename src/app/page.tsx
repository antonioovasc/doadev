"use client";
import React, { useState } from "react";

export default function Home() {
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [dashboardContent, setDashboardContent] = useState("");

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
    alert(text);
  }

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login bem-sucedido!");
    } else {
      alert(data.message || "Erro no login.");
    }
  }

  // Acessar painel
  async function accessDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado.");
      return;
    }

    const response = await fetch("http://localhost:4000/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const content = await response.text();
      setDashboardContent(content);
    } else {
      setDashboardContent("Acesso negado. Token inválido ou expirado.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">doadev - Sistema de Autenticação</h1>

      {/* Registro */}
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
          <button type="submit" className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600">
            Registrar
          </button>
        </form>
      </section>

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
          <button type="submit" className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600">
            Entrar
          </button>
        </form>
      </section>

      {/* Painel */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Painel</h2>
        <button
          onClick={accessDashboard}
          className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600 mb-4"
        >
          Acessar Painel
        </button>
        <div className="border p-4 min-h-[80px]">{dashboardContent}</div>
      </section>
    </div>
  );
}
