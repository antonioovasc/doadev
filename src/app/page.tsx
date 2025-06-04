"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showRegister, setShowRegister] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [changeEmail, setChangeEmail] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSuccess(response.ok);
    setMessage(text);

    if (response.ok) {
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setShowRegister(false);
    }
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
        setIsSuccess(false);
        setMessage(data.message || "Credenciais inválidas.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Erro ao fazer login.");
    }
  }

  // Alterar senha
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
    setIsSuccess(response.ok);
    setMessage(response.ok ? "Senha atualizada com sucesso!" : text || "Erro ao atualizar a senha.");

    if (response.ok) {
      setChangeEmail("");
      setChangeNewPassword("");
      setShowChangePassword(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-[#1E3A5F] tracking-wide">
          Doa<span className="text-[#16324B]">Dev</span>
        </h1>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-md text-sm shadow-sm select-text border ${
              isSuccess
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Login */}
        {!showRegister && !showChangePassword && (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#1E3A5F] border-b pb-2">
                Login
              </h2>
              <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <button
                  type="submit"
                  className="bg-[#1E3A5F] hover:bg-[#16324B] text-white font-semibold py-3 rounded-lg shadow-md transition"
                >
                  Entrar
                </button>
              </form>
            </section>

            <div className="flex flex-col space-y-2 text-center">
              <button
                onClick={() => {
                  setShowRegister(true);
                  setMessage("");
                }}
                className="text-sm text-[#1E3A5F] font-medium hover:underline"
              >
                Não tem uma conta? Registrar-se
              </button>

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setMessage("");
                }}
                className="text-sm text-[#1E3A5F] font-medium hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
          </>
        )}

        {/* Registro */}
        {showRegister && (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#1E3A5F] border-b pb-2">
                Registrar
              </h2>
              <form onSubmit={handleRegister} className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <button
                  type="submit"
                  className="bg-[#1E3A5F] hover:bg-[#16324B] text-white font-semibold py-3 rounded-lg shadow-md transition"
                >
                  Registrar
                </button>
              </form>
            </section>

            <button
              onClick={() => setShowRegister(false)}
              className="text-sm text-[#1E3A5F] font-medium hover:underline block mx-auto"
            >
              Já tem uma conta? Fazer login
            </button>
          </>
        )}

        {/* Alterar senha */}
        {showChangePassword && (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-[#1E3A5F] border-b pb-2">
                Alterar Senha
              </h2>
              <form onSubmit={handleChangePassword} className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={changeEmail}
                  onChange={(e) => setChangeEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <button
                  type="submit"
                  className="bg-[#1E3A5F] hover:bg-[#16324B] text-white font-semibold py-3 rounded-lg shadow-md transition"
                >
                  Atualizar Senha
                </button>
              </form>
            </section>

            <button
              onClick={() => setShowChangePassword(false)}
              className="text-sm text-[#1E3A5F] font-medium hover:underline block mx-auto"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
