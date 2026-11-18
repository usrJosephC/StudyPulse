# Execução técnica pelo portal — 17/11/2026

Executor: Codex (agente de QA), sem participante humano. Branch `feat/sprint-priorities`, base `21129f2` com alterações locais. Aplicação Web exportada em `http://localhost:8093`, backend Compose em `http://localhost:54321`. Viewport 460×828; user agent mobile não equivale a dispositivo Android real. Conta sintética `qa1.demo@studypulse.local`.

## CT-01 — ciclo de tarefa

- Antes: 70 pontos. Criada pela interface `QA17 tarefa ciclo`, categoria IHC, data atual implícita, id local 132. Uma única linha encontrada no banco.
- Concluída pela interface: `done=true`; saldo 75. Após recarregar, a tela mostrou 4/4 tarefas e 75 pontos.
- Reaberta pela interface: `done=false`; pontos permaneceram 75. A regra atual não estorna pontos de tarefa ao reabrir.
- Dois cliques disparados no mesmo ciclo de eventos: estado final `done=true`, saldo permaneceu 75. Não houve prêmio duplicado ao concluir novamente.
- Evidências: CT01-antes.png, CT01-criada.png, CT01-concluida.png, CT01-reinicio.png, CT01-reaberta.png.
- Conclusão funcional: PASS. A verificação temporal de Scale/Fade é complementada na rodada de motion; screenshots isoladas não demonstram duração.

## CT-02 — check-in

- Antes: 75 pontos, sequência de 1 dia.
- Um clique no CTA produziu `Check-in concluído: +10 pontos.`, botão `Check-in feito` desabilitado, saldo 85 e sequência 2.
- Após recarregar, a UI voltou a oferecer `Fazer check-in`. Uma nova tentativa mostrou `Você já fez o check-in de hoje.`; banco manteve saldo 85, sequência 2 e exatamente um registro para a data local.
- Evidências: CT02-antes.png, CT02-sucesso.png, CT02-duplicado.png, CT02-banco.txt (colunas: pontos | streak | quantidade de check-ins hoje).
- Conclusão: idempotência/persistência PASS; observação de UX: botão não permanece marcado como concluído após relançar, embora o servidor impeça duplicação.

## CT-03 — criação/edição inicial

- Criada `QA17 meta ciclo`, categoria Estudos, duração 7. Id 68, vencimento 24/11/2026.
- Renomeada para `QA17 meta editada` sem alterar duração; vencimento permaneceu 24/11/2026.
- Evidência CT03-formulario.png. Ciclo completo adicional (progresso/conclusão/histórico/reload) consta em ui-results.json, com outra fixture identificada por id.

## Limites da coleta

Não foram usados dados reais de participantes. Consultas SQL acima foram somente de leitura. Não foi executado reset do banco. Capturas e vídeos são registros técnicos, não entrevistas ou opiniões humanas.
