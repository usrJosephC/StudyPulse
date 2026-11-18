<div align="center">
  <img src="study-pulse-app/assets/studypulse-logo-v1.png" alt="Logo StudyPulse" width="420" />

  # StudyPulse

  **Rotina de estudos gamificada com metas, consistência, pontos e grupos de estudo.**

  [![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F5CC00?style=for-the-badge)](https://github.com/usrJosephC/StudyPulse)
  [![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-003566?style=for-the-badge)](LICENSE)
</div>

---

## 🚀 O que tem aqui

- **Autenticação:** cadastro, login com aceite dos termos, restauração de sessão e logout com Supabase Auth.
- **Home personalizada:** progresso diário, tarefas, sequência de estudos e pontuação semanal e total.
- **Tarefas reais:** criação, listagem diária, conclusão e reabertura na Home, com atualização de progresso.
- **Metas de estudo:** criação, edição, atualização de progresso, conclusão, arquivamento e restauração.
- **Grupos de estudo:** criação com descrição, convite por código, cópia e compartilhamento separados, edição pelo criador, saída, ranking e feed.
- **Perfil integrado:** dados da conta, estatísticas reais e encerramento seguro da sessão.
- **Preferências e notificações:** edição do perfil, idioma, tema claro/escuro, acesso a termos e privacidade; notificações acessíveis pelo sino e pelo Perfil. A preferência local de lembretes não equivale a push remoto.
- **Dez conquistas:** catálogo visual e desbloqueios persistidos no servidor, com modal rolável.
- **Movimento acessível:** opção interna persistente de movimento reduzido, combinada à preferência do sistema; animações de progresso, checkmark e erro, além de transições de modais.
- **Gamificação consistente:** pontos registrados em ledger, bônus de sequência e operações idempotentes.
- **Internacionalização (i18n):** português, inglês e espanhol com i18next e react-i18next; pendências de feedback Web estão registradas abaixo.
- **Ambiente local reproduzível:** Docker Compose inicia banco, Auth, API, migrations e seed com um comando.

**Estado em 18/11/2026:** a [PR #36](https://github.com/usrJosephC/StudyPulse/pull/36) foi integrada à `dev` e promovida à `main` pela [PR #37](https://github.com/usrJosephC/StudyPulse/pull/37). Os recursos implementados ainda possuem limitações de validação; consulte a seção **Validação e pendências**.

---

## 💻 Stack

[![Expo](https://img.shields.io/badge/Expo%20SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native%200.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript%206-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2015-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

- **Expo SDK 57** e **React Native 0.86** para Android, iOS e web.
- **React 19** e **TypeScript** para interface e contratos tipados.
- **React Navigation 7** com Root Stack para autenticação e Bottom Tabs para o aplicativo.
- **React Hook Form** e **Yup** para formulários e validação.
- **Supabase Auth** para identidade e persistência de sessão.
- **Supabase JS** como cliente tipado do front-end.
- **PostgreSQL 15**, RLS, views, triggers e funções RPC para dados e regras protegidas.
- **Docker Compose** para reproduzir PostgreSQL, Auth, PostgREST e gateway localmente.
- **i18next** e **react-i18next** para internacionalização e gerenciamento das traduções da interface.
---

## 🎨 Sistema de design

Os tokens ficam em `study-pulse-app/src/theme/` e são compartilhados pelas telas e componentes.

| Papel | Valor |
|---|---|
| Amarelo principal | `#F5CC00` |
| Azul institucional | `#003566` |
| Fundo | `#FAFAFA` |
| Cards | `#FFFFFF` |
| Texto principal | `#212121` |
| Erro | `#C1121F` |

**Montserrat** é usada nos títulos e **Quicksand** no corpo, rótulos e controles. A interface reutiliza cards, botões, pills, avatar, barra e anel de progresso, cabeçalho e campos de autenticação.

O `MotionProvider` mantém a preferência interna de redução de movimento e respeita a do sistema: se qualquer uma estiver ativa, os movimentos são reduzidos ou removidos, preservando texto e estado final. Modais e navegação seguem a mesma preferência. Textos secundários e indicadores receberam ajustes de contraste; no Web, controles recebem contorno de foco visível. Isso não representa certificação integral de acessibilidade.

---

## 🧭 Fluxo da aplicação

O `AuthProvider` hidrata a sessão salva e o `RootStack` decide qual fluxo deve ser exibido:

1. Sem sessão: telas de login e cadastro.
2. Com sessão: navegação principal por Home, Goals, Groups e Profile.
3. As telas consomem hooks de domínio.
4. Os hooks chamam serviços que retornam `Result<T>`.
5. Os serviços acessam o Supabase tipado.
6. O banco aplica RLS e concentra operações sensíveis nas RPCs.

Essa separação mantém componentes visuais independentes do cliente de banco e padroniza os estados de carregamento e erro.

---

## 🔐 Banco e segurança

O schema atual contém:

- `profiles`
- `daily_tasks`
- `goals`
- `check_ins`
- `points_events`
- `squads`
- `squad_members`
- `squad_activity`
- `points_reversals`, `streak_history` e `weekly_resets`
- `badges` e `user_badges`

As policies de **Row Level Security** isolam os dados por usuário e por grupo. Check-ins, conclusão de tarefas e metas, progresso, entrada e saída de grupos passam por funções RPC autenticadas. A pontuação é escrita junto com a ação correspondente para reduzir duplicações e alterações indevidas pelo cliente.

As migrations recentes incluem edição de grupo pelo criador (006), catálogo e concessão de conquistas (007), cascata necessária à exclusão de conta (008) e restrição de escrita direta nas tabelas de progressão (009). A migration 009 mantém leitura autorizada e operações pelas RPCs existentes. A Edge Function `delete-account` requer configuração própria no servidor; ela não é iniciada pelo Compose principal.

---

## 📁 Estrutura

```text
design/                        # referências visuais, paleta e telas exportadas
entrega-ihc/                    # relatório, roteiro, casos e evidências de IHC
study-pulse-app/
├── assets/                 # logos, ícones e splash
├── scripts/                # inicialização local e descoberta do IP da rede
├── src/
│   ├── components/         # componentes reutilizáveis
│   ├── contexts/           # sessão, tema e preferência de movimento
│   ├── hooks/              # estado e operações consumidos pelas telas
│   ├── i18n/               # configuração i18n e traduções por idioma
│   ├── lib/                # cliente Supabase e Result<T>
│   ├── navigation/         # Root Stack e Bottom Tabs
│   ├── pages/              # composição de login e cadastro
│   ├── screens/            # Home, Goals, Groups e Profile
│   ├── services/           # contratos de acesso ao backend
│   ├── theme/              # cores, tipografia e espaçamento
│   ├── types/              # tipos do banco e do domínio
│   └── validation/         # schemas de formulário
├── supabase/
│   ├── docker/             # bootstrap do ambiente Compose
│   ├── migrations/         # schema, RLS, RPCs e suporte aos serviços
│   ├── tests/              # testes SQL de isolamento e idempotência
│   └── seed.sql            # dados sintéticos locais
├── tests/                  # testes automatizados da aplicação
└── docker-compose.yml      # stack local do backend
```

---

## ⚙️ Rodando localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/) compatível com Expo SDK 57 (ambiente validado: Node 22.20), npm e [Docker Desktop](https://www.docker.com/products/docker-desktop/). O comando `start:local` usa PowerShell. Mantenha a versão do Expo definida no projeto.

```bash
git clone https://github.com/usrJosephC/StudyPulse.git
cd StudyPulse/study-pulse-app
npm ci
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

No PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Inicie o backend local:

```bash
docker-compose up -d
```

Inicie o Expo em modo LAN:

```bash
npm run start:local
```

O script detecta o IPv4 ativo, atualiza a URL local do Supabase, garante a inicialização do Compose, aguarda a saúde do backend e abre o Expo para acesso pelo celular. O computador e o dispositivo devem estar na mesma rede. Copie `.env.example` apenas na primeira configuração, preservando um `.env` já existente.

### Web e atualização do ambiente

Com o backend iniciado, execute `npm run web`. O gateway aceita origens localhost, loopback e redes privadas, com os headers necessários ao Supabase/PostgREST. Essa configuração é destinada ao desenvolvimento local/LAN.

Após atualizar migrations ou a configuração do gateway:

```powershell
docker-compose run --rm migrations
docker-compose exec -T gateway nginx -t
docker-compose exec -T gateway nginx -s reload
```

Para dados sintéticos de demonstração, execute `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/seed-local-demo.ps1`. O script é restrito à API HTTP local/privada; as contas de demonstração são descritas na documentação de testes.

Execute o Compose por um único checkout: cópias do repositório usam o mesmo nome de projeto `studypulse`. Não inicie Supabase CLI em paralelo com esse backend. A porta 54321 pertence à API; a 8081 normalmente pertence ao Expo. Se o Expo oferecer 8082, outra instância pode estar usando 8081.

### Endpoints locais

| Serviço | Endereço |
|---|---|
| Supabase Auth, REST e RPC | `http://localhost:54321` |
| Health check | `http://localhost:54321/health` |
| PostgreSQL | Acesso interno ao Compose: `docker-compose exec db psql -U postgres -d postgres` |

---

## 🧰 Scripts úteis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o Expo no modo padrão |
| `npm run start:local` | Prepara o IP local, verifica o backend e inicia o Expo em LAN |
| `npm run android` | Inicia o Expo e abre o Android |
| `npm run ios` | Inicia o Expo e abre o iOS |
| `npm run web` | Inicia a versão web |
| `npm run export:web` | Carrega `.env` e exporta a aplicação Web para `dist/` |
| `npm run typecheck` | Verifica os contratos TypeScript |
| `npm test` | Executa os testes da aplicação |
| `npm run lint` | Executa a análise estática |
| `node scripts/test-local-cors.mjs` | Verifica CORS no gateway local em execução |
| `node scripts/test-local-sql.mjs` | Executa suítes SQL locais e exige ROLLBACK sem falhas |
| `npm run db:start` | Inicia a stack Docker |
| `npm run db:stop` | Encerra a stack sem apagar os dados |
| `npm run db:status` | Mostra o estado dos containers |
| `npm run db:logs` | Acompanha os logs da stack |

Também é possível controlar diretamente o backend:

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
docker-compose down
```

---

## ✅ Validação e pendências

```bash
npm run typecheck
npm test
npm run lint
npm run export:web
```

Os testes SQL ficam em `study-pulse-app/supabase/tests/` e cobrem RLS, privilégios e idempotência das operações principais.

Na rodada registrada em 17/11 e na conferência anterior à PR #36: typecheck e 5 testes passaram; lint teve zero erros e 11 avisos; 138 verificações CORS e 104 assertions SQL em sete suítes passaram. O CI Quality da PR #36 também passou. Esses resultados não substituem os testes dos fluxos na interface.

O QA técnico Web registrou **7 casos aprovados, 4 reprovados e 2 bloqueados**. Joseph confirmou no Chrome os mesmos erros encontrados na execução automatizada no Edge. Permanecem:

- Mensagem de credenciais inválidas sem feedback visível na Web e orientação incorreta no estado vazio de tarefas (#21/#17).
- Confirmações de saída do grupo e arquivamento de meta que não abrem na Web (#18/#19).
- Exclusão de conta bloqueada no Compose testado por ausência da rota da Edge Function (HTTP 404; #31).
- Revalidação de Android, leitor de tela real e compartilhamento externo nesta versão.

Resultados e evidências: [resumo do QA](entrega-ihc/evidencias/qa17/RESUMO-QA.md). Esses limites impedem afirmar aprovação integral do aplicativo.

---

## 📚 Documentação

- [Projeto, equipe e links externos](PROJECT_INFO.md)
- [Supabase local](study-pulse-app/supabase/README.md)
- [Entrega de IHC em 18/11/2026](entrega-ihc/LEIA-ME.md)

### Entrega acadêmica e versão web

O StudyPulse é o projeto oficial da entrega. JSX descreve a estrutura da interface; `StyleSheet` e `Animated` implementam apresentação e movimento; TypeScript descreve eventos e estado e é compilado para JavaScript. React Native Web converte os componentes para o navegador. `npm run export:web` gera `dist/index.html` e seus recursos, carregando `.env` antes do Expo e limpando o cache; exige Node 20.12 ou superior. O código-fonte continua em `study-pulse-app/src/`. Confirme login no resultado servido por HTTP: compilação sem erro não comprova configuração da API.

A versão web utiliza o mesmo backend local das versões móveis. Inicie o Docker Compose antes de `npm run web`, configure `.env` a partir de `.env.example` e reinicie o Expo quando alterar as variáveis. Abrir somente o HTML exportado por `file://` não substitui um servidor HTTP nem inicia a API.

O relatório principal, o roteiro e os casos de teste são documentos separados em `entrega-ihc/`, acompanhados das fontes e evidências. A avaliação externa prevista não foi realizada; os resultados internos estão identificados como tal. Procedimentos específicos de entrega ficam no [LEIA-ME acadêmico](entrega-ihc/LEIA-ME.md).

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
