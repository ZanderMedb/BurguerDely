# 🍔 Burguer Dely

Cardápio digital com carrinho, checkout com PIX real, e rastreamento de pedidos.

---

## ⚡ Instalação rápida

### Passo 1 — Instale o Node.js (obrigatório)
Baixe e instale: **https://nodejs.org/** (versão LTS recomendada)

### Passo 2 — Instale o Bun (recomendado, mais rápido que npm)

**Mac/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

> Se não quiser instalar o Bun, tudo funciona com `npm` também (já vem com o Node.js).

---

### Passo 3 — Rode o script de instalação

**Mac/Linux** — abra o terminal na pasta do projeto e rode:
```bash
chmod +x instalar.sh
./instalar.sh
```

**Windows** — dê dois cliques no arquivo `instalar.bat`

> Ou instale manualmente:
> ```bash
> bun install   # ou: npm install
> ```

---

### Passo 4 — Rode o projeto

```bash
bun dev       # ou: npm run dev
```

Acesse **http://localhost:8080** no navegador 🎉

---

## ⚙️ Build para produção

```bash
bun run build   # ou: npm run build
```

Saída gerada em `./dist/`

---

## 🔑 Configurar sua chave PIX

Edite o arquivo `src/pages/Checkout.tsx` e altere a linha:

```ts
const PIX_KEY = "burguer-dely@pagamentos.com";
```

Substitua pelo seu **CPF, CNPJ, email ou chave aleatória** cadastrada no banco.

---

## 🛠 Tecnologias

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router DOM
- Leaflet (mapa de entrega)
- QRCode (geração do QR Code PIX no padrão BR Code)
