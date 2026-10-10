<div align="center">
  <img src="study-pulse-app/assets/studypulse-logo-v1.png" alt="Logo StudyPulse" width="420" />

  # StudyPulse

  **Rotina de estudos gamificada com metas, consistência, pontos e grupos de estudo.**

  [![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F5CC00?style=for-the-badge)](https://github.com/usrJosephC/StudyPulse)
  [![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-003566?style=for-the-badge)](LICENSE)
</div>

---

## 🚀 O que tem aqui

- **Autenticação completa:** cadastro, login, restauração de sessão e logout com Supabase Auth.
- **Home personalizada:** progresso diário, tarefas, sequência de estudos e pontuação semanal e total.
- **Tarefas reais:** listagem diária e conclusão com pontuação, com contrato de criação pronto na camada de serviços.
- **Metas de estudo:** criação, atualização de progresso, conclusão e mapa de consistência.
- **Grupos de estudo:** entrada por código de convite, ranking semanal e feed de atividades.
- **Perfil integrado:** dados da conta, estatísticas reais e encerramento seguro da sessão.
- **Gamificação consistente:** pontos registrados em ledger, bônus de sequência e operações idempotentes.
- **Ambiente local reproduzível:** Docker Compose inicia banco, Auth, API, migrations e seed com um comando.

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

As policies de **Row Level Security** isolam os dados por usuário e por grupo. Check-ins, conclusão de tarefas e metas, progresso, entrada e saída de grupos passam por funções RPC autenticadas. A pontuação é escrita junto com a ação correspondente para reduzir duplicações e alterações indevidas pelo cliente.

---

## 📁 Estrutura

```text
design/                        # referências visuais, paleta e telas exportadas
study-pulse-app/
├── assets/                 # logos, ícones e splash
├── scripts/                # inicialização local e descoberta do IP da rede
├── src/
│   ├── components/         # componentes reutilizáveis
│   ├── context/            # sessão e perfil autenticado
│   ├── hooks/              # estado e operações consumidos pelas telas
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

**Pré-requisitos:** [Node.js](https://nodejs.org/) e [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/usrJosephC/StudyPulse.git
cd StudyPulse/study-pulse-app
npm install
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

O script detecta o IPv4 ativo, atualiza a URL local do Supabase e abre o Expo para acesso pelo celular. O computador e o dispositivo devem estar na mesma rede.

### Endpoints locais

| Serviço | Endereço |
|---|---|
| Supabase Auth, REST e RPC | `http://localhost:54321` |
| Health check | `http://localhost:54321/health` |
| PostgreSQL | `postgresql://postgres:postgres@localhost:54322/postgres` |

---

## 🧰 Scripts úteis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o Expo no modo padrão |
| `npm run start:local` | Prepara o IP local, verifica o backend e inicia o Expo em LAN |
| `npm run android` | Inicia o Expo e abre o Android |
| `npm run ios` | Inicia o Expo e abre o iOS |
| `npm run web` | Inicia a versão web |
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

## ✅ Validação

```bash
npx tsc --noEmit
npx tsx --test tests/auth.test.ts
```

Os testes SQL ficam em `study-pulse-app/supabase/tests/` e cobrem RLS, privilégios e idempotência das operações principais.

---

## 📚 Documentação

- [Projeto, equipe e links externos](PROJECT_INFO.md)
- [Supabase local](study-pulse-app/supabase/README.md)

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).
