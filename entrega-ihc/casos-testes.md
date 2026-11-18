# Casos de teste internos — StudyPulse

**Versão do protocolo:** 17/11/2026  
**Branch de referência:** `feat/sprint-priorities`  
**Escopo:** validação funcional e técnica executável pela própria equipe

> **Limitação obrigatória:** o requisito acadêmico de avaliar o produto com pelo menos duas pessoas externas à equipe **NÃO FOI ATENDIDO**. As identidades `p1.demo` e `p2.demo` abaixo são contas sintéticas (fixtures), não participantes reais. A execução destes casos pela equipe não equivale a um teste de usabilidade externo e não permite relatar opiniões, sensações, tempos ou resultados de P1/P2 reais.

## 1. Regras de registro

Rodada executada por Codex em 17/11/2026. Resultado consolidado: **7 aprovados no escopo Web, 4 reprovados e 2 bloqueados**. Aprovação Web não abrange Android nativo, leitor de tela real ou avaliação com pessoas. Registros detalhados: `evidencias/qa17/RESUMO-QA.md`. Tentativas iniciais do harness e retestes estão identificados nos JSONs; o resultado consolidado abaixo prevalece.

| Estado | Uso |
|---|---|
| `NÃO EXECUTADO` | Caso ainda não iniciado. |
| `APROVADO` | Todos os resultados esperados foram observados e há evidência. |
| `REPROVADO` | Um ou mais resultados esperados não ocorreram; registrar a divergência. |
| `BLOQUEADO` | Dependência técnica impediu a conclusão; registrar a causa. |

Não registrar tokens, chaves, cookies, senhas digitadas ou dados pessoais em capturas e logs. Nomear evidências com o ID do caso, por exemplo `CT-02-03-tarefa-concluida.png`. As colunas “resultado observado” permanecem vazias até a execução.

## 2. Ambiente e dados sintéticos

### 2.1 Pré-condições comuns

1. Confirmar a branch e o commit sob teste com `git branch --show-current` e `git rev-parse --short HEAD`.
2. Iniciar o backend local conforme o fluxo adotado pela equipe (Docker Compose ou Supabase CLI).
3. Aplicar migrations e popular dados locais. Para o seed reproduzível da equipe:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/seed-local-demo.ps1
   ```

4. Configurar o app para o Supabase **local**, nunca para produção, e iniciar Expo/Web.
5. Registrar dispositivo, sistema, navegador/Expo Go, URL local e commit na ficha de execução.
6. Recriar o seed antes de uma nova rodada quando um caso alterar dados compartilhados.

### 2.2 Contas-fixture locais

| Identificador técnico | E-mail local | Senha local | Papel inicial |
|---|---|---|---|
| Fixture P1 | `p1.demo@studypulse.local` | `StudyPulseP1!2026` | Proprietário da “Equipe StudyPulse” |
| Fixture P2 | `p2.demo@studypulse.local` | `StudyPulseP2!2026` | Membro da “Equipe StudyPulse” |
| Fixture descartável | `delete.fixture@studypulse.local` | `DeleteFixture!2026` | Exclusão de conta; criar apenas no ambiente local |

Esses nomes servem apenas para distinguir massas de dados. Não usar “Participante P1/P2” em conclusões do relatório.

### 2.3 Ficha de execução

- Executor: Codex, agente de QA automatizado (sem participante humano)
- Data: 17/11/2026; timestamps dos arquivos de evidência registram as capturas.
- Commit de base: 21129f2 + alterações locais em feat/sprint-priorities.
- Plataforma: Windows, Microsoft Edge/Chromium 157.0.4341.60, viewport 460×836; portal 460×828.
- Backend: Docker Compose em http://localhost:54321; app exportado em http://localhost:8093.
- Evidências: entrega-ihc/evidencias/qa17/. Contas qa1.demo, qa.run17a/qa.run17b e delete.qa17 são fixtures sintéticas.

## 3. Três tarefas principais

### CT-01 — Criar, concluir e reabrir uma tarefa

- **Tipo/prioridade:** funcional, P0
- **Resultado:** `APROVADO — Web`
- **Objetivo:** verificar o ciclo principal de uma tarefa e a atualização visual associada.
- **Pré-condições:** ambiente comum; seed aplicado; Fixture P1 autenticada; tela inicial aberta.
- **Dados:** título único `Caso interno - revisar animações - <HHMM>`; data de hoje.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Registrar a quantidade de tarefas concluídas, progresso e pontos antes da ação. | Estado inicial legível e consistente com o seed. |
| 2 | Acionar a criação de tarefa, preencher título/categoria e salvar; a data é o dia atual automaticamente. | Tarefa aparece na lista sem recarregar manualmente; não há duplicata. |
| 3 | Marcar a nova tarefa como concluída uma única vez. | Check fica no estado concluído; feedback de escala + opacidade ocorre quando movimentos estão ativos; progresso/contagem/pontos são atualizados uma vez. |
| 4 | Sair da tela e retornar ou atualizar a aplicação. | Estado concluído persiste no backend. |
| 5 | Reabrir/desmarcar a tarefa. | Estado volta a pendente e os indicadores ficam coerentes, sem saldo duplicado. |
| 6 | Repetir rapidamente o toque no controle. | A interface bloqueia ou serializa envios; não cria atualização duplicada/inconsistente. |

**Evidências obrigatórias:** captura antes da criação; tarefa criada; estado concluído com indicadores; estado após recarregar; estado reaberto; log de erro apenas se houver divergência.  
**Resultado observado:** Tarefa id 132 criada uma vez; saldo 70→75 na conclusão, persistiu após reload; reabertura preservou saldo e nova conclusão/duplo clique não duplicou pontos. Animação normal: 109 frames, 13 valores de escala e 31 do arco.  
**Divergências/issue:** Observação: pontos de tarefa não são estornados na reabertura. Ver portal-observations.md e final-results.json.

### CT-02 — Fazer check-in diário com idempotência

- **Tipo/prioridade:** funcional + integração, P0
- **Resultado:** `APROVADO — Web`
- **Objetivo:** verificar check-in, streak e pontos sem premiar duas vezes no mesmo dia.
- **Pré-condições:** seed aplicado **sem** `-IncludeCompletedCheckIns`; Fixture P1 autenticada; registrar pontos e streak iniciais.
- **Dados:** data local atual em `America/Sao_Paulo`.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Acionar o check-in diário. | Botão entra em carregamento e impede novo envio concorrente. |
| 2 | Aguardar o retorno. | Mensagem/estado de sucesso aparece; streak e pontos refletem exatamente um check-in. |
| 3 | Tentar executar novamente no mesmo dia. | UI impede a ação ou backend devolve resultado idempotente/conflito tratado; nenhum segundo bônus é concedido. |
| 4 | Reabrir a aplicação. | Check-in, streak e pontos persistem. |
| 5 | Conferir o registro no backend local, sem editar dados. | Existe no máximo um check-in da conta para a data local. |

**Evidências obrigatórias:** antes/depois de pontos e streak; botão após check-in; segunda tentativa; consulta/log sanitizado comprovando unicidade.  
**Resultado observado:** Check-in alterou saldo 75→85 e streak 1→2. Repetição após reload mostrou aviso e manteve exatamente um registro diário.  
**Divergências/issue:** UX: CTA volta a oferecer check-in após reload; servidor impede duplicação. #17. CT02-banco.txt e capturas CT02.

### CT-03 — Criar, editar e concluir uma meta

- **Tipo/prioridade:** funcional + integração, P0
- **Resultado:** `APROVADO — Web`
- **Objetivo:** validar o ciclo principal de metas e a persistência dos dados reais.
- **Pré-condições:** ambiente comum; Fixture P2 autenticada; tela Metas aberta.
- **Dados:** `Caso interno - estudar IHC - <HHMM>`; categoria `Estudos`; duração de 7 dias. A UI não possui campo de descrição.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Criar a meta com os dados definidos. | Validação aceita dados válidos; meta aparece entre as ativas uma única vez. |
| 2 | Editar título/categoria sem alterar a duração; avançar progresso pelo CTA em passos de 25%. | Valores novos aparecem e persistem, mantendo a duração. |
| 3 | Alterar o progresso até a conclusão pelo fluxo disponível. | Meta recebe estado concluído; feedback e pontuação ocorrem uma única vez. |
| 4 | Reabrir a aplicação. | Estado final e campos persistem, sem voltar ao mock/valor anterior. |
| 5 | Consultar histórico de metas. | Conclusão aparece no histórico, sem apagar indevidamente os dados da meta. O heatmap não substitui esta verificação. |

**Evidências obrigatórias:** formulário preenchido sem senha/chaves; lista ativa; edição; conclusão; estado após reinício; histórico/heatmap.  
**Resultado observado:** Criação e edição pela UI preservaram vencimento 24/11/2026. Progresso avançou até 100%; conclusão persistiu e apareceu no histórico após reload.  
**Divergências/issue:** Sem divergência funcional confirmada neste caso. ui-results.json e CT03-history.png.

## 4. Movimento e acessibilidade

### CT-04 — Repetição com “Reduzir movimentos” do aplicativo

- **Tipo/prioridade:** acessibilidade, P0
- **Resultado:** `APROVADO — Web`
- **Objetivo:** garantir que a preferência interna remove movimento sem remover informação ou função.
- **Pré-condições:** Fixture P1; sistema sem redução forçada; preferência do app inicialmente desligada.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Em Perfil/Preferências, ativar “Reduzir movimentos”. | Controle confirma ativação. |
| 2 | Fechar e reabrir o app. | Preferência permanece ativa. |
| 3 | Repetir CT-01 com outro título único. | Check e indicadores chegam imediatamente ao estado final, sem transição de escala/opacidade/progresso; resultado funcional permanece correto. |
| 4 | Fazer logout e enviar Login/Cadastro com dados inválidos, mantendo a preferência ativa. | Campo não se desloca; mensagem de erro permanece visível e anunciável por leitor de tela. |
| 5 | Abrir/fechar modais e navegar entre autenticação e app. | Transições configuradas como reduzidas não fazem slide/fade; conteúdo final permanece disponível. |
| 6 | Desativar a preferência e reiniciar. | Movimento volta apenas se o sistema também não solicitar redução. |

**Evidências obrigatórias:** preferência antes/depois do reinício; vídeo curto da tarefa; vídeo/registro do erro; captura do estado final. Não afirmar conforto ou preferência de usuário externo.  
**Resultado observado:** Preferência interna persistiu após reload. Na tarefa reduzida foram coletados 103 frames sem escala intermediária; check final correto. Erro textual de termos continuou disponível após logout.  
**Divergências/issue:** Anúncio por leitor real pertence ao CT07 e não foi validado. supplement-results.json; vídeo CT04-execution.webm.

### CT-05 — Respeito à redução de movimento do sistema

- **Tipo/prioridade:** acessibilidade, P0
- **Resultado:** `APROVADO — emulação Web`
- **Objetivo:** verificar que a preferência do sistema prevalece sobre a preferência interna desligada.
- **Pré-condições:** dispositivo/emulador compatível; preferência interna desligada.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Ativar “remover/reduzir animações” nas configurações de acessibilidade do sistema e reiniciar o app. | App detecta a preferência e reduz os movimentos. |
| 2 | Repetir os passos 3 a 5 de CT-04. | Estados finais, mensagens e ações permanecem; transições evitáveis não são exibidas. |
| 3 | Conferir o controle interno enquanto a redução do sistema está ativa. | Controle desabilitado e explicação visível; redução continua ativa, pois a regra é sistema **OU** usuário. |
| 4 | Desligar a redução do sistema e reiniciar. | Movimento volta se nenhuma das duas preferências estiver ativa. |

**Evidências obrigatórias:** tela de configuração do sistema sem dados pessoais; vídeo antes/depois; plataforma e versão.  
**Resultado observado:** Prefers-reduced-motion emulado: switch marcado e desabilitado com explicação; mudança da media query e reload respeitados.  
**Divergências/issue:** Android nativo não testado: nenhum dispositivo/emulador conectado. #32. supplement-results.json; vídeo CT05-execution.webm.

### CT-06 — Comparador técnico rápido/lento

- **Tipo/prioridade:** protocolo visual interno, P1
- **Resultado:** `APROVADO — Web`
- **Objetivo:** comparar durações de forma controlada, sem apresentar a comparação como pesquisa de usabilidade.
- **Pré-condições:** abrir `entrega-ihc/comparacao-motion.html` em navegador atual; DevTools sem limitação de CPU.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Deixar “Reduzir movimentos” desmarcado e acionar “Comparar checkmarks”. | Versões de 120 ms e 360 ms partem/reiniciam e chegam ao mesmo check final; a diferença temporal é observável. |
| 2 | Acionar “Comparar barras”. | Versões de 180 ms e 600 ms chegam ao mesmo preenchimento final com curva ease-out cúbica. |
| 3 | Repetir cada comparação três vezes e alternar qual região é observada primeiro. | Resultado final não muda entre repetições; não há estado preso. |
| 4 | Marcar “Reduzir movimentos” e repetir. | Elementos saltam ao estado final, preservando conteúdo e operação. |
| 5 | Operar controles apenas por teclado. | Foco é visível; checkbox e botões podem ser acionados. |

**Evidências obrigatórias:** gravação de tela rápida/lenta; captura em reduced motion; observações estritamente técnicas. Não preencher “preferiu”, “sentiu” ou “achou mais claro” em nome de pessoas inexistentes.  
**Resultado observado:** Três ciclos de cada comparação chegaram ao mesmo estado final. Redução e acionamento por Enter passaram. Tempos observados escala ≈144/359 ms e barra ≈180/597 ms, rápida antes da lenta.  
**Divergências/issue:** Medição técnica sujeita a frame rate; não há percepção humana. comparator-timing.json; vídeo CT06-execution.webm.

### CT-07 — Acesso por teclado, leitor de tela e estados anunciados

- **Tipo/prioridade:** acessibilidade, P1
- **Resultado:** `BLOQUEADO — parcial`
- **Objetivo:** verificar acesso básico além da animação.
- **Pré-condições:** Web com teclado e leitor de tela disponível, ou TalkBack/VoiceOver no dispositivo.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Percorrer Login, Home, Metas, Grupos e Perfil usando navegação assistiva. | Controles interativos têm nome compreensível, função e estado; ordem acompanha a interface. |
| 2 | Submeter Login inválido. | Erro é exposto em texto e anunciado; foco não fica perdido. |
| 3 | Concluir uma tarefa e efetuar check-in. | Alteração de estado pode ser percebida sem depender de cor/movimento; estado ocupado/desabilitado é comunicado. |
| 4 | Aumentar fonte/zoom do sistema ou navegador. | Conteúdo essencial continua legível e acionável, sem sobreposição impeditiva. |

**Evidências obrigatórias:** plataforma/leitor/versão; sequência de foco; transcrição curta dos anúncios; capturas com zoom.  
**Resultado observado:** Foco sólido de 3 px observado; com CSS zoom 200% o último controle foi rolado e acionado. Não houve leitor de tela real com confirmação de áudio.  
**Divergências/issue:** Não aprovar anúncios sem Narrator/TalkBack/VoiceOver. final-results.json, CT07-focus.png, CT07-zoom-last-control.png.

## 5. Segurança, persistência e integração

### CT-08 — Autenticação e controle de acesso

- **Tipo/prioridade:** segurança funcional, P0
- **Resultado:** `REPROVADO`
- **Objetivo:** confirmar que rotas autenticadas dependem de sessão real e que erros não expõem detalhes sensíveis.
- **Pré-condições:** app sem sessão; Fixture P1 existente.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Tentar entrar com e-mail P1 e senha incorreta. | Mensagem segura em idioma ativo; usuário permanece no Login; nenhum token/stack trace é mostrado. |
| 2 | Entrar com credenciais válidas da Fixture P1. | Root navigator libera a área principal apenas após sessão válida. |
| 3 | Reiniciar o app. | Sessão é hidratada sem loop e rota principal é restaurada. |
| 4 | Sair pelo Perfil. | Sessão local é removida e Login reaparece. |
| 5 | Reiniciar novamente. | Área protegida continua inacessível até novo login. |

**Evidências obrigatórias:** erro sanitizado; área principal; reinício; logout; logs sem credenciais/tokens.  
**Resultado observado:** Login válido, sessão/reload e logout passaram. Senha incorreta retornou HTTP 400, mas a mensagem de credenciais inválidas não apareceu no Web.  
**Divergências/issue:** Falha vinculada a #21: Login usa Alert.alert para o erro remoto. Evidências CT12-*-invalid.png e final-results.json.

### CT-09 — Grupo, convite e isolamento RLS

- **Tipo/prioridade:** integração + segurança, P0
- **Resultado:** `REPROVADO`
- **Objetivo:** verificar convite/compartilhamento, permissões de proprietário e isolamento de membro.
- **Pré-condições:** seed aplicado; P1 proprietário e P2 membro da “Equipe StudyPulse”.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Entrar como Fixture P1, abrir Grupos e exibir o código de convite. | Código real do grupo é visível; ação compartilhar/copiar oferece o mesmo código sem expor outros dados. |
| 2 | Como P1, editar nome/subtítulo com valores válidos. | Atualização é salva e aparece para membros. |
| 3 | Tentar nome vazio e descrição acima do limite. | Validação rejeita valores inválidos sem corromper o grupo. |
| 4 | Sair e entrar como Fixture P2; tentar editar por UI e, se a UI ocultar a ação, pela chamada de teste autorizada. | Membro não proprietário não consegue editar; estado permanece intacto. |
| 5 | Como P2, sair do grupo. | Membership da P2 é removida; dados de P1/grupo não são apagados. |
| 6 | Usar o convite para entrar novamente, se o fluxo estiver disponível. | P2 volta como membro e não como proprietário; ranking/feed ficam limitados ao grupo. |
| 7 | Rodar a suíte SQL local. | Todos os testes TAP, incluindo `squad_update.sql`, retornam `ok` e encerram com `ROLLBACK`. |

Comando recomendado:

```powershell
node scripts/test-local-sql.mjs
```

**Evidências obrigatórias:** código + share sheet sanitizado; edição de P1; rejeição de P2; saída/reentrada; saída terminal TAP.  
**Resultado observado:** Cópia contém só código (8 caracteres); edição UI pelo criador passou, membro não vê ação. RPC rejeita membro com 403 e dados inválidos com 400; saída/reentrada pela API preservam criador. Botão Sair no Web não abre confirmação.  
**Divergências/issue:** #18: Alert.alert não apresenta confirmação Web. Share nativo disponível, envio externo não executado. backend-results.json e supplement-results.json.

### CT-10 — Arquivar/restaurar meta e preservar histórico

- **Tipo/prioridade:** integração + persistência, P0
- **Resultado:** `REPROVADO`
- **Objetivo:** verificar que uma meta arquivada sai das ativas, permanece no histórico e pode ser restaurada sem perda.
- **Pré-condições:** seed aplicado; Fixture P1; meta `Concluir apresentação da Sprint` presente.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Registrar nome, prazo, progresso e categoria da meta. | Estado inicial documentado. |
| 2 | Arquivar a meta pelo fluxo da UI. | Meta deixa a lista ativa e aparece no histórico/arquivadas. |
| 3 | Reiniciar o app e abrir o histórico. | Arquivamento persiste. |
| 4 | Restaurar a meta. | Meta retorna às ativas com prazo, progresso e categoria preservados. |
| 5 | Reiniciar e conferir novamente. | Restauração persiste sem duplicar a meta. |
| 6 | Rodar a suíte SQL local. | Testes TAP de histórico retornam `ok` e finalizam com `ROLLBACK`. |

**Evidências obrigatórias:** antes; ativa ausente; histórico; restauração; depois do reinício; saída TAP.  
**Resultado observado:** Botão Arquivar não abre confirmação nem altera archived_at. API arquiva/restaura corretamente; restauração pela UI de fixture arquivada preservou 50% e prazo 24/11, incluindo reload.  
**Divergências/issue:** #19: handleArchive depende de Alert.alert. ui-results.json, backend-results.json, final-results.json e capturas CT10.

### CT-11 — CORS e autenticação no Expo Web

- **Tipo/prioridade:** integração web, P0
- **Resultado:** `APROVADO — local`
- **Objetivo:** garantir que origens locais previstas funcionam e origens não autorizadas não recebem CORS permissivo.
- **Pré-condições:** backend local saudável em `http://localhost:54321`; Node disponível.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Executar `node scripts/test-local-cors.mjs`. | Script encerra com código 0 e informa `PASS: 138 CORS assertions`; origens permitidas têm headers exigidos e `Vary: Origin`. |
| 2 | Conferir no log os cenários negados (`example.org`, localhost malicioso e origem `null`). | Nenhum recebe autorização CORS indevida. |
| 3 | Iniciar Expo Web em uma origem local aceita e entrar como Fixture P1. | Login conclui sem loop/erro genérico de rede. |
| 4 | Abrir Network e inspecionar preflight e requisição. | Preflight é aceito; resposta JSON é legível; nenhum segredo aparece no console. |
| 5 | Repetir em porta/origem local prevista, se usada pela apresentação. | Comportamento permanece consistente. |

**Evidências obrigatórias:** saída completa do script; Network sanitizado; captura pós-login; URL/porta utilizada.  
**Resultado observado:** 138 verificações CORS passaram. Login e leitura reais no Web local (8081 e exportado 8093) funcionaram; API/SQL validadas separadamente.  
**Divergências/issue:** Não extrapolar para implantação remota. #7. cors.txt, sql.txt e capturas pós-login.

### CT-12 — Idioma e persistência da preferência

- **Tipo/prioridade:** internacionalização, P1
- **Resultado:** `REPROVADO`
- **Objetivo:** verificar Português, Inglês e Espanhol nos fluxos principais e a persistência da seleção.
- **Pré-condições:** Fixture P1 autenticada; Perfil/Preferências disponível.

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Selecionar Português, reiniciar e percorrer Home, Metas, Grupos e Perfil. | Seleção persiste; títulos, ações, estados vazios e erros observados estão em português, sem mistura evitável. |
| 2 | Selecionar Inglês e repetir. | Seleção persiste; mesmos elementos aparecem em inglês. |
| 3 | Selecionar Espanhol e repetir. | Seleção persiste; mesmos elementos aparecem em espanhol. |
| 4 | Em cada idioma, provocar Login inválido, lista vazia e validação de formulário. | Mensagens dinâmicas acompanham o idioma; códigos/nomes próprios não são traduzidos indevidamente. |
| 5 | Voltar ao idioma definido para a apresentação. | Preferência final persiste após reinício. |

**Evidências obrigatórias:** matriz de telas × idioma; mensagens de erro/empty state; reinício.  
**Resultado observado:** PT/EN/ES persistem após reload; telas e estados vazios renderizam nos três idiomas. Erros de credenciais não aparecem nos três idiomas. Texto vazio orienta a aba de metas incorretamente; PT ainda contém Goals.  
**Divergências/issue:** #21: corrigir mensagem visível e orientação para criar tarefa na Home. final-results.json, supplement-results.json e capturas CT12.

### CT-13 — Exclusão de conta descartável

- **Tipo/prioridade:** segurança + privacidade, P0, destrutivo local
- **Resultado:** `BLOQUEADO — ambiente`
- **Objetivo:** verificar exclusão da própria conta sem permitir escolher/deletar outro usuário.
- **Pré-condições:** **somente ambiente local descartável**; Supabase CLI e Edge Function `delete-account` disponíveis; service-role local em arquivo não versionado; criar exclusivamente `delete.fixture@studypulse.local`. Não usar P1/P2.

Preparação: utilizar exclusivamente a stack local já identificada. Não executar `db reset`: ele apagaria dados locais alheios ao caso. Se a função não estiver disponível nessa stack, registrar bloqueio; uma stack isolada pode ser provisionada sem compartilhar seus volumes/portas.

```powershell
npx supabase functions serve delete-account --env-file supabase/.env.local
```

| Passo | Ação | Resultado esperado |
|---:|---|---|
| 1 | Criar a Fixture descartável e alguns dados próprios; registrar os IDs técnicos, sem token. | Conta e dados existem apenas no ambiente local. |
| 2 | Entrar nessa conta, abrir Perfil e solicitar exclusão; cancelar na primeira confirmação. | Nada é removido após cancelar. |
| 3 | Solicitar novamente e confirmar. | Função valida o bearer token e remove somente o usuário autenticado; app encerra a sessão após sucesso. |
| 4 | Tentar entrar novamente com a mesma credencial. | Login falha porque a conta não existe. |
| 5 | Conferir backend local. | Perfil/dados dependentes seguem as regras de exclusão; Fixtures P1/P2 permanecem intactas. |
| 6 | Fazer chamada sem token e, em teste isolado, enviar no corpo um ID diferente. | Sem token é rejeitado; corpo não permite selecionar outro usuário para exclusão. |

Se a Edge Function não estiver servida, registrar `BLOQUEADO — função delete-account indisponível`; não substituir por exclusão manual e não alegar aprovação.

**Evidências obrigatórias:** criação da fixture; cancelamento; confirmação; retorno sanitizado da função; login posterior negado; consulta comprovando P1/P2 intactas.  
**Resultado observado:** Cancelar preserva a conta. Confirmar mostra erro tratado. Rota real /functions/v1/delete-account retorna HTTP 404; stack Compose não publica a Edge Function. Fixture não foi excluída administrativamente.  
**Divergências/issue:** #31/#7: configurar função no ambiente e repetir. SQL de cascata passou, mas não substitui teste da função. CT13-function-missing.png e backend-results.json.

## 6. Encerramento da rodada

1. Conferir se cada caso tem executor, data, commit, plataforma, resultado e evidências.
2. Abrir issue para cada divergência reproduzível, vinculando o ID do caso e omitindo segredos.
3. Restaurar o seed local quando necessário e remover apenas a fixture descartável que ainda existir.
4. Não transformar estes resultados internos em frases como “dois participantes aprovaram”, “usuários preferiram” ou “o teste de usabilidade foi concluído”.
5. No relatório da disciplina, declarar separadamente:
   - quais casos técnicos foram executados pela equipe;
   - quais resultados foram obtidos, com evidência;
   - que a avaliação com duas pessoas externas permaneceu pendente/não atendida.

## 7. Resultado consolidado da rodada

| Caso | Resultado | Evidências |
|---|---|---|
| CT-01 | APROVADO — Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-02 | APROVADO — Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-03 | APROVADO — Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-04 | APROVADO — Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-05 | APROVADO — emulação Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-06 | APROVADO — Web | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-07 | BLOQUEADO — parcial | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-08 | REPROVADO | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-09 | REPROVADO | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-10 | REPROVADO | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-11 | APROVADO — local | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-12 | REPROVADO | `evidencias/qa17/RESUMO-QA.md` e registros do caso |
| CT-13 | BLOQUEADO — ambiente | `evidencias/qa17/RESUMO-QA.md` e registros do caso |

**Avaliação externa:** NÃO EXECUTADA / REQUISITO NÃO ATENDIDO. Turma e contribuições finais dos integrantes humanos continuam dependentes da equipe.
