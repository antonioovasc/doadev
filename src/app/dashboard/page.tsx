"use client";

import { Header } from "./_components/header";

export default function DashboardPage() {
  return (
    <div>
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mt-6">Bem-vindo ao seu painel!</h1>
        <p className="mt-2 text-gray-600">
          Aqui você pode gerenciar sua conta e visualizar suas doações.
        </p>
      </main>
    </div>
  );
}
