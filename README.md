# SUPPORT · Sistema de Gestão

Sistema interno da SUPPORT Terceirizações — Clientes, Contratos, Funcionários, Supervisão e Financeiro.

- **Frontend:** HTML/CSS/JS puro, em `public/index.html` (identidade visual da SUPPORT).
- **Backend:** Netlify Functions (`netlify/functions/*.mjs`), uma para cada recurso (clientes, contratos, funcionarios, visitas, financeiro), com persistência via **Netlify Blobs** — não precisa contratar nem configurar nenhum banco de dados externo.

## Como publicar no Netlify

### Opção A — pelo site do Netlify (mais simples)
1. Crie um repositório no GitHub e suba esta pasta inteira nele (ou use o "Deploy manual" abaixo).
2. Em [app.netlify.com](https://app.netlify.com), clique em **Add new site → Import an existing project** e conecte o repositório.
3. O Netlify já vai detectar as configurações pelo arquivo `netlify.toml` (pasta publicada: `public`, funções: `netlify/functions`). Não precisa mexer em nada — é só clicar em **Deploy**.
4. Pronto. O site fica em `https://SEUSITE.netlify.app` e as rotas de API já funcionam em `/api/clientes`, `/api/contratos`, `/api/funcionarios`, `/api/visitas` e `/api/financeiro`.

### Opção B — deploy manual (sem GitHub)
1. Instale a CLI do Netlify: `npm install -g netlify-cli`
2. Dentro da pasta do projeto: `netlify deploy --prod`
3. Siga as instruções no terminal (login e escolha/criação do site).

### Testar localmente antes de publicar
```bash
npm install
npm run dev
```
Isso abre o site em `http://localhost:8888` já com as funções de API funcionando (via `netlify dev`).

> **Importante:** se você só abrir o arquivo `public/index.html` direto no navegador (sem Netlify), as chamadas de API não vão funcionar — é assim mesmo, porque o backend só existe quando o Netlify está rodando (seja em produção, seja via `netlify dev`).

## Estrutura do projeto
```
support-gestao/
├── netlify.toml              → configuração do Netlify
├── package.json              → dependência do Netlify Blobs
├── public/
│   ├── index.html            → todo o frontend
│   └── assets/                → logotipo e ícone da SUPPORT
└── netlify/functions/
    ├── _lib/crud.mjs         → lógica genérica de CRUD (reaproveitada)
    ├── clientes.mjs
    ├── contratos.mjs
    ├── funcionarios.mjs
    ├── visitas.mjs
    └── financeiro.mjs
```

## Dados de partida
Na primeira vez que o site rodar, ele semeia automaticamente:
- Cliente **Ed. MYLENA** (síndica Letícia)
- Contrato assinado via Clicksign para o Ed. MYLENA
- Funcionários **Evandro** (Zelador, folga quarta) e **Julhyana** (ASG, folga terça)

## Próximos passos sugeridos
- Trocar o "Responsável" fixo da supervisão por um seletor de usuários, se mais de uma pessoa for fazer visitas.
- Adicionar autenticação (Netlify Identity é a opção mais rápida) antes de usar com dados sensíveis de produção.
- Exportar relatórios (financeiro, supervisão) em PDF — pode ser um próximo módulo.
