# Validação técnica interna — 17/11/2026

Executor: **Codex, agente de QA automatizado**. Não houve sessão com participantes humanos. Base `21129f2`, branch `feat/sprint-priorities`, alterações locais ainda não commitadas. Aplicação exportada servida em `http://localhost:8093`; API Docker Compose em `http://localhost:54321`. Navegador Microsoft Edge/Chromium 157.0.4341.60, Windows, viewport 460×836. Portal adicional 460×828. Preferência do sistema emulada por `prefers-reduced-motion`, não por Android nativo.

## Resultado consolidado

**7 aprovados no escopo Web, 4 reprovados e 2 bloqueados.** “Aprovado” não significa validação Android, leitor de tela, compartilhamento por aplicativos externos ou usabilidade humana. As contas qa1.demo, qa.run17a/qa.run17b e delete.qa17 são sintéticas; não representam P1/P2 reais.

| Caso | Resultado | Evidência principal / conclusão |
|---|---|---|
| CT-01 Tarefas | APROVADO — Web | Criação, conclusão, reload, reabertura e duplo clique sem prêmio duplicado. 109 frames coletados, 13 valores de escala e 31 de arco na animação normal. |
| CT-02 Check-in | APROVADO — Web | Saldo 75→85; streak 1→2; repetição conserva 85 e apenas 1 registro diário. Após reload o CTA volta a oferecer check-in, mas a API impede duplicação. |
| CT-03 Metas | APROVADO — Web | Prazo 24/11 preservado após edição; progressos até 100%; meta concluída presente no histórico após reload. |
| CT-04 Movimento interno | APROVADO — Web | Preferência persiste; tarefa reduzida chegou ao estado final em 103 frames amostrados, sem escala intermediária; erro de termos permaneceu textual. |
| CT-05 Preferência do sistema | APROVADO — emulação Web | Media query reduzida prevalece, desabilita controle interno e mostra explicação; desativação e reload conferidos. Android nativo não testado. |
| CT-06 Comparador | APROVADO — Web | Três ciclos de escala/barra; estado final correto, redução e Enter funcionam. Medição observada rápida/lenta: escala ≈144/359 ms; barra ≈180/597 ms. São tempos técnicos sujeitos ao frame rate, não preferências humanas. |
| CT-07 Acessibilidade | BLOQUEADO — parcial | Foco sólido de 3 px confirmado; último item acessível com CSS zoom 200%. Leitor de tela com áudio não disponível. Não declarar anúncios aprovados. |
| CT-08 Autenticação | REPROVADO | Login válido, sessão/reload e logout passaram. Senha inválida retorna HTTP 400, mas a mensagem não aparece na interface. |
| CT-09 Grupos | REPROVADO | Edição pelo criador, proteção do membro, cópia de somente código e RPCs passaram. O botão Sair não abre confirmação no Web. Compartilhamento nativo disponível, mas envio externo não realizado. |
| CT-10 Histórico | REPROVADO | Arquivar pelo botão não abre confirmação nem muda o banco. Arquivar/restaurar via API passa; restaurar pela UI uma fixture arquivada também passa e preserva progresso 50% e prazo. |
| CT-11 CORS | APROVADO — local | 138 assertions; login real no Web exportado e no ambiente de desenvolvimento; origens e headers locais tratados. Não é teste de produção remota. |
| CT-12 Idiomas | REPROVADO | PT/EN/ES persistem e telas/estados vazios são localizados. Erros de credenciais não aparecem nos três idiomas. Estado vazio orienta criar tarefa em Goals/Objetivos, mas a criação ocorre em Home; PT ainda contém “Goals”. |
| CT-13 Exclusão | BLOQUEADO | Cancelamento preserva conta. Confirmação mostra erro tratado. Rota real `/functions/v1/delete-account` retorna 404 na stack Compose; não houve exclusão e não se usou exclusão administrativa como substituto. |

## Falhas reproduzíveis e rastreabilidade

1. **#19 — arquivamento Web:** entrar em Metas, clicar em Arquivar e observar ausência de diálogo/alteração. `GoalsScreen.handleArchive` depende de `Alert.alert`, cujo comportamento Web não apresenta a confirmação. Registro preservado com `archived_at=null`. API e restauração estão separadamente validadas.
2. **#18 — saída de grupo Web:** entrar como membro e clicar Sair; confirmação não aparece. `GroupsScreen.handleLeaveSquad` também usa `Alert.alert`. RPC de saída/reentrada funciona com usuário membro; propriedade do grupo permanece intacta.
3. **#21 — erro de login invisível:** credenciais incorretas em PT/EN/ES retornam HTTP 400, mas `Login.onSubmit` usa `Alert.alert` para exibir o erro. A animação/announcer não substitui mensagem visível no Web.
4. **#21 — orientação do estado vazio:** mensagem aponta para a aba de metas, embora a criação da tarefa esteja na Home. PT mantém “Goals”.
5. **#31 / #7 — ambiente de exclusão:** falta rota/runtime da Edge Function na stack Compose. A suíte SQL de cascata passa, mas não comprova execução da função publicada. Implantar/configurar no alvo correto e repetir CT-13 antes de aprovar.

Não foram modificados arquivos de produção nesta rodada de QA. Os achados estão mapeados às issues existentes; não houve commit, push, merge ou fechamento de issue.

## Registros que sustentam os resultados

- `portal-observations.md`: sequência manual automatizada de tarefa e check-in; SQL de leitura e capturas CT01/CT02.
- `ui-results.json`: primeira execução ampla. Inclui falhas do harness (seletores/tempo de fechamento); não tratá-las automaticamente como defeitos de produto. Retestes específicos abaixo prevalecem.
- `supplement-results.json`: retestes de redução, sistema, comparador, idiomas, grupos e exclusão. CT13 foi repetido após aguardar fechamento do modal.
- `final-results.json`: motion normal, restauração pela UI, erros de credenciais/estados vazios nos três idiomas e foco/zoom. O reteste esperou a lista terminar de carregar antes de avaliar o vazio.
- `backend-results.json`: contratos reais HTTP com tokens mantidos apenas em memória. Criador HTTP 200; membro HTTP 403; campos inválidos HTTP 400; saída/reentrada HTTP 200; histórico preservado.
- `comparator-timing.json` e `CT01-motion-samples.json`: amostras temporais reais.
- `cors.txt`: 138 assertions aprovadas; `sql.txt`: 104 assertions, sete suítes e ROLLBACK.
- `videos/CT*-execution.webm` e `videos/CT*-final.webm`: registros automatizados dos cenários, sem entrevista, áudio humano ou preferência subjetiva.
- Imagens `CT*.png`: estados, erros e resultados observados. Arquivos com `failure`/`block` podem retratar tentativas de harness; interpretar com os JSONs e o resultado consolidado.

## Limitações finais

- Nenhum Android/emulador conectado foi encontrado por `maestri portal devices`.
- Nenhum leitor de tela real foi operado com confirmação auditiva. Foco, semântica DOM e vídeo não substituem esse teste.
- A disponibilidade de `navigator.share` não comprova entrega de convite em aplicativo externo; nenhum convite foi enviado a terceiros.
- Testes somente no backend local e browser desktop com viewport estreita. Não extrapolar para SDK/Expo Go, iOS, teclado físico Android ou produção.
- O requisito de dois participantes externos e duas melhorias derivadas deles continua **não atendido**. As limitações não são preenchidas com personagens ou sensações inventadas.
- Turma/período e contribuições finais dos integrantes humanos ainda dependem de confirmação da equipe.

## Reexecução

Os scripts `run-ui.cjs`, `run-backend.cjs`, `run-supplement.cjs`, `run-finalchecks.cjs` e `measure-comparator.cjs` usam Playwright instalado isoladamente em `%TEMP%/studypulse-qa-tools`, Microsoft Edge local, API em 54321, app exportado em 8093 e comparador em 8092. Criam somente fixtures de QA. Não rodam `db reset`. Não executá-los contra produção. Nomes de fixtures e portas são parte do ambiente registrado, não configuração de deploy.
