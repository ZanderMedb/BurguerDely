export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground/60 py-10 mt-auto">
      <div className="container text-center">
        <p className="font-heading font-bold text-primary text-lg mb-2">🍔 Burguer Dely</p>
        <p className="text-sm">Sabor artesanal na sua casa em minutos</p>
        <p className="text-xs mt-4">&copy; {new Date().getFullYear()} Burguer Dely. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
