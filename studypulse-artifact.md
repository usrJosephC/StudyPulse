# Artifact — StudyPulse

Snapshot técnico do repositório [StudyPulse](https://github.com/usrJosephC/StudyPulse), conferido em `C:\Users\Joseph\Documents\Faculdade\IHC` em 10 de outubro de 2026.

## Snapshot

- Projeto: aplicativo mobile de rotina de estudos com gamificação.
- Aplicação: `study-pulse-app/`.
- Branch ativa: `feat/sprint1-services-integration`.
- Commit de referência: `e0060bc` — `fix: inicializar Supabase local com Docker Compose`.
- Pull request: [#2 — feat/sprint1-services-integration → dev](https://github.com/usrJosephC/StudyPulse/pull/2), aberto.
- Stack principal: Expo SDK 57, React Native 0.86, React 19, TypeScript, Supabase, PostgreSQL 15 e Docker Compose.

## O que o projeto faz

O StudyPulse ajuda estudantes a organizar uma rotina diária e manter consistência. O aplicativo reúne tarefas, metas, check-ins, sequência de dias estudados, pontos e grupos com ranking. A proposta combina acompanhamento individual com incentivo social e feedback visual de progresso.

O fluxo atual permite criar conta, autenticar, visualizar dados reais do usuário, listar e concluir tarefas, criar e concluir metas, acompanhar pontos e streak, consultar o heatmap de consistência e entrar em um grupo por convite para acompanhar ranking e atividades. A criação de tarefas e o check-in já possuem services e hooks, mas ainda precisam de uma ação explícita nas telas.

## Por que foi construído assim

- **Expo e React Native:** permitem manter uma base compartilhada para Android, iOS e web e facilitam a demonstração pelo Expo Go.
- **Supabase:** reúne autenticação, PostgreSQL, API REST e execução de funções SQL em um único backend.
- **RLS:** aplica isolamento no banco mesmo que uma chamada seja feita fora da interface oficial.
- **RPCs:** concentram operações que alteram mais de uma entidade, como concluir uma tarefa e registrar seus pontos.
- **Services e hooks:** impedem que telas dependam diretamente do cliente Supabase e padronizam carregamento, erro e atualização.
- **`Result<T>`:** transforma falhas de rede, autenticação e banco em resultados explícitos e mensagens acionáveis.
- **Docker Compose:** reduz diferenças entre ambientes e inicia a infraestrutura local com migrations e seed automáticos.

## Como funciona

### Front-end

`App.tsx` registra fontes, tema, área segura e o `AuthProvider`. O `RootStack` observa a sessão: usuários anônimos acessam Login e Register; usuários autenticados entram no `RootTabs`, formado por Home, Goals, Groups e Profile.

Cada tela usa hooks como `useTasks`, `useGoals`, `usePoints`, `useStreak`, `useHeatmap`, `useSquad`, `useRanking` e `useSquadActivity`. Esses hooks mantêm estado local e chamam os serviços correspondentes. Os serviços validam a entrada, usam o cliente tipado e retornam `Result<T>`.

### Backend

O Supabase expõe autenticação e PostgREST. O banco possui oito tabelas de domínio, policies RLS, uma view de pontos e funções RPC para check-in, tarefas, metas e squads. Triggers criam o perfil após o cadastro, geram códigos de convite e alimentam o feed do grupo.

### Ambiente local

O `docker-compose.yml` inicia quatro serviços permanentes:

1. PostgreSQL com a base do Supabase.
2. GoTrue para autenticação.
3. PostgREST para tabelas, views e RPCs.
4. Nginx como gateway único na porta `54321`.

Um container transitório registra e aplica migrations pendentes em ordem, executa o seed uma vez e termina com código zero. O volume Docker preserva os dados entre reinícios.

## Escopo funcional atual

### Autenticação

- Cadastro com nome, e-mail, senha e metadados do perfil.
- Login por e-mail e senha.
- Persistência e renovação automática da sessão.
- Hidratação do perfil associado ao usuário.
- Logout pela tela de perfil.
- Erros de autenticação convertidos para mensagens em português.

### Home e perfil

- Tarefas reais do dia.
- Alternância entre tarefa pendente e concluída.
- Progresso diário calculado a partir das tarefas.
- Pontos totais e semanais.
- Streak atual.
- Nome, e-mail, data de entrada e estatísticas do usuário.

### Metas

- Listagem de metas ativas.
- Criação com categoria, título e duração em dias.
- Atualização de progresso.
- Conclusão de meta com pontuação.
- Heatmap de consistência baseado em check-ins e tarefas.

### Grupos

- Entrada por código de convite.
- Serviço e hook preparados para saída do grupo; a ação ainda não está exposta na tela.
- Ranking semanal por pontos e streak.
- Feed de atividades gerado por check-ins e conclusões.

## Modelo de dados

| Entidade | Responsabilidade |
|---|---|
| `profiles` | Perfil público mínimo ligado ao usuário Auth |
| `daily_tasks` | Tarefas diárias e estado de conclusão |
| `goals` | Metas, prazo, progresso e conclusão |
| `check_ins` | Registro diário único de estudo |
| `points_events` | Ledger imutável de pontos por ação |
| `squads` | Grupo, temporada e código de convite |
| `squad_members` | Associação entre usuário e grupo |
| `squad_activity` | Eventos exibidos no feed do grupo |

## Migrations

| Arquivo | Conteúdo |
|---|---|
| `001_schema.sql` | Extensão, tabelas, constraints, índices e triggers iniciais |
| `002_rls.sql` | RLS, policies, grants e helpers de autorização |
| `003_rpcs_views.sql` | Pontos, streak, heatmap, ranking, check-in, conclusão e squads |
| `004_services_support.sql` | Progresso de metas, reabertura de tarefas, saída e feed de squads |

## Estrutura relevante

- `study-pulse-app/src/context/AuthContext.tsx`: estado global da sessão e do perfil.
- `study-pulse-app/src/navigation/`: decisão entre autenticação e aplicação, além das tabs.
- `study-pulse-app/src/screens/`: telas principais integradas aos dados reais.
- `study-pulse-app/src/hooks/`: contratos de estado usados pela interface.
- `study-pulse-app/src/services/`: operações de autenticação e domínio.
- `study-pulse-app/src/types/`: tipos gerados do banco e modelos de domínio.
- `study-pulse-app/supabase/migrations/`: evolução versionada do banco.
- `study-pulse-app/docker-compose.yml`: infraestrutura local reproduzível.
- `study-pulse-app/scripts/start-local.ps1`: IP da rede, backend e Expo LAN.

## Como executar

```bash
cd study-pulse-app
npm install
cp .env.example .env
docker-compose up -d
npm run start:local
```

No PowerShell, substitua `cp .env.example .env` por `Copy-Item .env.example .env`.

Comandos operacionais:

```bash
docker-compose ps
docker-compose logs -f
docker-compose down
```

## Decisões e convenções

1. Telas consomem hooks e não importam o cliente Supabase diretamente.
2. Serviços públicos retornam `Result<T>` em vez de lançar erros técnicos para a UI.
3. Operações de gamificação sensíveis ficam no banco e usam `auth.uid()` como identidade.
4. Funções `SECURITY DEFINER` usam `search_path` explícito.
5. A pontuação não pode ser editada diretamente pelo usuário autenticado.
6. Datas de negócio usam `America/Sao_Paulo` nas regras SQL.
7. O seed contém somente dados sintéticos e só produz conteúdo quando há usuários locais.
8. O front aceita publishable key e anon key por compatibilidade.
9. O diretório `docs/` é reservado ao contexto local e permanece fora do Git.
10. Commits do projeto usam exclusivamente a autoria dos integrantes responsáveis.

## O que foi concluído nesta branch

- Migração para Expo SDK 57 preservada como base.
- Contrato tipado de autenticação e domínio.
- Schema, RLS, views, RPCs, triggers e seed do Supabase.
- Services e hooks de check-in, pontos, tarefas, metas e squads.
- Integração das quatro telas principais com dados reais.
- Correções de criação de metas e alinhamento da navegação inferior.
- Inicialização do Expo em rede local com descoberta automática do IPv4.
- Stack Docker Compose com migrations e seed automáticos.
- Documentação do ambiente e comandos operacionais.

## Verificações conhecidas

- `npx tsc --noEmit`: aprovado.
- `npx tsx --test tests/auth.test.ts`: 4 testes aprovados.
- Cadastro local: aprovado com usuário e sessão reais.
- Leitura protegida de perfil via PostgREST: aprovada.
- Health check da stack: aprovado.
- Containers de banco, Auth, REST e gateway: saudáveis.
- Runner de migrations: encerrado com código zero e reinicialização idempotente.

## Onde estamos

A Sprint 1 possui sua infraestrutura principal e as integrações planejadas implementadas na branch `feat/sprint1-services-integration`. O PR #2 está aberto contra `dev`. O aplicativo já demonstra autenticação e os fluxos principais com persistência real no Supabase local.

## Próximos passos

- Validar o fluxo completo em Android e iOS físicos com contas distintas.
- Cobrir services e hooks de domínio com testes automatizados adicionais.
- Executar novamente os testes SQL em um banco recriado do zero antes do merge.
- Padronizar os textos restantes da interface em português.
- Revisar estados vazios, feedback de check-in e ações ainda apresentadas apenas visualmente.
- Preparar configuração separada do Supabase hospedado para homologação e apresentação.

## Leitura recomendada antes de novas mudanças

1. `README.md`.
2. `PROJECT_INFO.md`.
3. Este artifact.
4. `study-pulse-app/supabase/README.md`.
5. As migrations e os contratos em `src/types/domain.ts`.
