# Roteiro de teste com participantes externos

> Atualização de 17/11: a equipe informou indisponibilidade de participantes externos. Este roteiro fica preservado como proposta NÃO EXECUTADA. Para a execução interna, use `casos-testes.md`. Resultados internos não atendem ao requisito de duas pessoas externas e não devem ser atribuídos a P1/P2 fictícios.

StudyPulse — IHC — AFYA/UNIMA — Prof. Icaro Ferreira — entrega 18/11/2026.

## Preparação do moderador

Convide duas pessoas que não integrem a equipe. Identifique-as somente como P1 e P2. Explique o objetivo e peça consentimento para capturas ou gravação; não registre rosto, voz ou dados pessoais sem concordância. Cada sessão dura aproximadamente 15 a 20 minutos. Registre data, plataforma, navegador/dispositivo, largura da tela, versão do código e condição de movimento. Use as contas locais de demonstração do LEIA-ME. Se o check-in já foi realizado no mesmo dia, use uma nova conta de teste; não apague registros para simular um resultado.

Leia: “Estamos avaliando a interface, não você. Faça as tarefas do seu jeito e diga o que estiver pensando. Você pode parar quando quiser. Primeiro tentaremos sem ajuda.” Não indique onde clicar. Se a pessoa não conseguir prosseguir, registre a dificuldade e a ajuda dada antes de orientar.

## Tarefas para ler ao participante

1. **Organizar e concluir:** “Você precisa revisar um conteúdo de IHC hoje. Registre essa atividade, marque-a como concluída e explique como percebeu que foi concluída. Depois corrija a marcação, como se ainda faltasse estudar.”
2. **Registrar presença:** “Você estudou hoje e quer registrar sua presença diária. Faça isso e explique o resultado mostrado.”
3. **Planejar uma meta:** “Crie uma meta de estudo para os próximos sete dias. Depois altere o título e confira se a duração foi preservada.”

Repita a tarefa 1 com **Preferências → Reduzir movimentos** ativado. Não descreva qual sensação a pessoa deveria ter. Pergunte: “O que mudou? O resultado continuou claro? Alguma versão causou desconforto ou demora?”

## Observar cinco animações

Além das três tarefas, peça para abrir o histórico de metas (Slide), abrir conquistas no Perfil (Fade) e enviar um formulário vazio (Shake). A conclusão de tarefa mostra Scale + Fade e animação de dados. Observe o estado também com movimento reduzido. A animação não comprova que o servidor respondeu: confirme o resultado persistido.

## Comparação rápida e lenta

Abra `comparacao-motion.html`. Compare checkmarks de 120/360 ms e barras de 180/600 ms. P1 observa a versão rápida primeiro; P2 observa a lenta primeiro. As durações atuais no aplicativo são 180 ms e 300 ms. Registre clareza, demora, desconforto e preferência. O comparador é uma simulação documentada e não substitui as tarefas reais.

## Ficha individual — preencher uma cópia por participante

- Participante: P1 / P2
- Data e hora:
- Dispositivo e plataforma:
- Versão/commit ou manifesto do pacote:
- Consentimento para captura/gravação: sim / não
- Movimento normal e reduzido verificados:

| Rodada | Sem ajuda / com ajuda / não concluiu | Dificuldade observável e ajuda fornecida | Sensação relatada (fala/paráfrase fiel) | Sugestão | Evidência |
|---|---|---|---|---|---|
| Tarefa 1 | | | | | |
| Tarefa 2 | | | | | |
| Tarefa 3 | | | | | |
| Tarefa 1 reduzida | | | | | |
| Comparação checkmark | | | | | |
| Comparação barra | | | | | |

Não preencher campos vazios com resultados presumidos. Emoção esperada pela equipe e sensação relatada pelo participante são dados diferentes.

## Duas melhorias depois dos testes

Para cada melhoria registre: problema observado; participante/tarefa; evidência anterior; alteração; motivo; arquivo/commit; repetição da tarefa; resultado observado; evidência posterior. Escolha os dois problemas de maior impacto entre os achados reais. Correções técnicas prévias, como CORS, não substituem melhorias decorrentes do teste externo.

## Capturas ou OBS

Com consentimento, no OBS selecione Captura de janela para o navegador/aplicativo, enquadre somente a interface e evite gravar outras janelas. Inicie a gravação antes da tarefa e encerre após o relato. Alternativa: capture antes, ação e resultado em imagens. Nomeie `P1_T1_antes.png`, `P1_T1_resultado.png`, `P1_T1_reduzido.png`; repita para P2. Guarde evidências privadas fora do ZIP até revisar dados pessoais.

As capturas em `evidencias/tecnicas/` são verificações automatizadas da interface e não representam sessões P1/P2.
