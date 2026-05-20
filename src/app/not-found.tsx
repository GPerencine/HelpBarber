import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-extrabold text-primary">404</h1>
      <p className="text-xl font-semibold">Página não encontrada</p>
      <p className="text-muted-foreground max-w-sm">
        O endereço que você acessou não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
