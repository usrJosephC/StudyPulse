---
titulo: "StudyPulse: interface, animação e experiência"
subtitulo: "Relatório acadêmico de Interação Humano-Computador"
instituicao: "AFYA - Centro Universitário de Maceió (UNIMA)"
disciplina: "Interação Humano-Computador"
professor: "Prof. Icaro Ferreira"
turma: "[PENDENTE - informar turma]"
autores: "Joseph Bartholomeu Cavalcante Rocha; Letícya Beatryz dos Santos Medeiros; Mariana Pereira de Melo"
data_documento: "17 de novembro de 2026"
data_entrega: "18 de novembro de 2026"
versao: "Modelo preenchido v1 - avaliação externa não executada"
---

# RESUMO

O StudyPulse é um aplicativo de rotina de estudos que reúne tarefas, metas, check-in diário, pontos, sequência de estudos e grupos. Este relatório descreve decisões de interface e cinco animações implementadas no aplicativo oficial em Expo e React Native. A análise considera feedback de ação, comunicação de progresso, mudança de estado e redução de movimento. O documento também apresenta três trechos comentados de código, um comparador entre versões rápida e lenta e o método que seria usado em uma avaliação com duas pessoas externas à equipe. Essa avaliação externa não foi executada; portanto, o requisito de duas pessoas externas não foi atendido e não há resultados, sensações ou melhorias derivadas de P1/P2. A validação interna documentada separadamente não equivale a teste de usabilidade. Nenhum dado de participante foi inventado.

**Palavras-chave:** interação humano-computador; animação de interface; acessibilidade; React Native; experiência do usuário.

> **Situação em 17/11/2026:** a equipe informou que não conseguirá recrutar pessoas externas. A entrega passa a documentar validação técnica e casos de teste internos. O requisito de duas pessoas externas **NÃO FOI ATENDIDO**. O método de P1/P2 é mantido apenas para transparência metodológica; não representa sessões realizadas. Não existem conclusões sobre sensações de participantes nem duas melhorias decorrentes desses testes externos.

## Convenção editorial adotada

A apresentação usa página A4, margens acadêmicas, hierarquia numerada, texto corrido legível, legendas e identificação institucional inspiradas em práticas de apresentação ABNT. A organização técnica usa resumo, palavras-chave, seções numeradas, método, resultados e referências numéricas inspirados em artigos IEEE. Como esses estilos possuem finalidades e regras diferentes, este trabalho não declara conformidade integral simultânea com ABNT e IEEE. A convenção híbrida foi adotada apenas para manter apresentação acadêmica brasileira e estrutura técnica rastreável.

<!-- pagebreak -->

# 1 IDENTIFICAÇÃO E CONTEXTO

## 1.1 Identificação

| Campo | Informação |
|---|---|
| Projeto | StudyPulse |
| Instituição | AFYA - Centro Universitário de Maceió (UNIMA) |
| Disciplina | Interação Humano-Computador |
| Professor | Prof. Icaro Ferreira |
| Turma | [PENDENTE - informar turma] |
| Integrantes | Joseph Bartholomeu Cavalcante Rocha; Letícya Beatryz dos Santos Medeiros; Mariana Pereira de Melo |
| Data do documento | 17/11/2026 |
| Entrega prevista | 18/11/2026 |

## 1.2 Público-alvo, necessidade e objetivo

O público-alvo é formado por estudantes que precisam organizar atividades, acompanhar sua constância e receber feedback compreensível sobre o que já foi realizado. A necessidade concreta é reduzir a incerteza durante o planejamento: a pessoa deve conseguir registrar uma tarefa, concluí-la e entender imediatamente como essa ação alterou seu progresso.

O objetivo de interface é conduzir o fluxo **planejar - agir - confirmar - acompanhar**. A tela Home concentra o fluxo principal, enquanto Goals, Groups e Profile ampliam a experiência com metas, colaboração e histórico pessoal.

## 1.3 Escopo tecnológico e equivalência com a proposta da disciplina

O projeto oficial usa Expo SDK 57, React Native, React e TypeScript. A disciplina descreve estrutura HTML, apresentação CSS e comportamento JavaScript. No StudyPulse, a correspondência técnica usada neste relatório é:

| Conceito solicitado | Equivalente no projeto |
|---|---|
| HTML | JSX/TSX, componentes e propriedades de acessibilidade |
| CSS | `StyleSheet`, propriedades visuais e valores animados |
| JavaScript | TypeScript, handlers, hooks e `Animated` |

Essa equivalência foi escolhida pela equipe para a entrega; não há neste documento comprovação de aceite específico do professor. O relatório não afirma que React Native gera os mesmos elementos e regras de uma página HTML tradicional; ele demonstra as mesmas responsabilidades de estrutura, apresentação e comportamento.

## 1.4 Estado verificável do projeto

A branch de consolidação analisada é `feat/sprint-priorities`, no commit `21129f2`. A Pull Request #30 foi mesclada em `dev` em 11/11/2026 e o workflow Quality foi concluído com sucesso. O repositório registra typecheck, lint, testes unitários e testes SQL. Essas verificações comprovam consistência técnica, mas não substituem o teste de usabilidade externo exigido para P1 e P2.

<!-- pagebreak -->

# 2 FLUXO PRINCIPAL DA INTERFACE

## 2.1 Sequência principal

1. A pessoa entra no aplicativo e chega à Home autenticada.
2. Seleciona **Adicionar tarefa**.
3. Informa título e categoria e salva.
4. A tarefa aparece na lista do dia.
5. Ao tocar na tarefa, o aplicativo envia a operação e bloqueia ações sobrepostas.
6. Após o sucesso, o ícone de conclusão muda, o contador é atualizado e o anel de progresso avança.
7. A pontuação é atualizada por meio do fluxo protegido do backend.
8. A tarefa pode ser reaberta quando a pessoa precisa corrigir a ação.

## 2.2 Início, ação e resultado

| Momento | Elemento | Comunicação |
|---|---|---|
| Início | Lista de tarefas e CTA | Mostra o estado atual e o próximo passo disponível. |
| Ação | Toque em salvar ou concluir | Desabilita repetição enquanto a operação está em andamento. |
| Resultado | Ícone, texto, contador e progresso | Confirma a alteração sem depender somente do movimento. |
| Correção | Toque em tarefa concluída | Reabre a tarefa e mantém o estado coerente. |

## 2.3 Fluxos complementares usados no teste

- **Check-in:** comunica operação em andamento e atualiza streak/pontos após sucesso.
- **Metas:** usa formulário, barra de progresso e mudança de estado de uma meta.
- **Grupos:** usa convite, ranking e feed, mas não integra o roteiro curto de P1/P2 desta versão.

<!-- pagebreak -->

# 3 INVENTÁRIO DAS CINCO ANIMAÇÕES REAIS

As cinco animações abaixo existem no código da branch analisada. Emoções são hipóteses da equipe e não resultados de teste. A avaliação externa não foi executada; por isso, a coluna correspondente registra a ausência de evidência, sem simular P1/P2.

## 3.1 Animação 1 - tremor de erro do formulário

| Campo | Registro |
|---|---|
| Nome e localização | Shake horizontal em Login, Register e campo de gênero; hook `src/hooks/useErrorShake.ts`. |
| Gatilho | Submissão inválida ou erro que exige correção. |
| Função | Direcionar atenção ao grupo de campos e anunciar a mensagem de erro. |
| Emoção esperada | Orientação e recuperação, tratadas como hipótese. |
| Benefício | Liga o feedback ao local onde a correção é necessária. |
| Risco | Tremor repetido pode parecer punitivo ou causar desconforto. |
| Decisão técnica | Sequência `translateX`: -8, 8, -6, 6 e 0; durações 55, 70, 70, 70 e 55 ms, total de 320 ms. Curva linear nos quatro primeiros segmentos e `Easing.out(Easing.cubic)` na chegada. |
| Movimento reduzido | Consulta o contexto compartilhado, que combina preferência manual e do sistema. Quando ativo, não executa o tremor e interrompe o efeito em curso; a mensagem permanece disponível. |
| Evidência externa | NÃO EXECUTADA — não houve P1/P2 externos. |

## 3.2 Animação 2 - preenchimento da barra de progresso

| Campo | Registro |
|---|---|
| Nome e localização | Barra animada em `src/components/ProgressBar.tsx`, usada em progresso de metas. |
| Gatilho | Alteração do valor de progresso recebido pelo componente. |
| Função | Mostrar a proporção entre estado anterior e novo estado. |
| Emoção esperada | Continuidade e avanço, como hipótese. |
| Benefício | Evita mudança visual abrupta e mantém escala de 0 a 100%. |
| Risco | Se lenta, pode atrasar a leitura; sem texto, poderia depender somente de forma/cor. |
| Decisão técnica | `Animated.timing`, duração de 300 ms, interpolação de largura e `Easing.out(Easing.cubic)`, com desaceleração na chegada. O anel e contador da Home são outras aplicações da mesma família de animação de dados, com 320 ms. |
| Movimento reduzido | O valor final é aplicado diretamente com `setValue(clamped)`. O valor textual de progresso permanece na tela que usa o componente. |
| Evidência externa | NÃO EXECUTADA — não houve P1/P2 externos. |

## 3.3 Animação 3 - Slide de painéis

| Campo | Registro |
|---|---|
| Nome e localização | Slide nos modais de criação e histórico de metas; `src/screens/GoalsScreen.tsx`. Também aplicado aos grupos e preferências. |
| Gatilho | Abrir ou fechar um painel por um botão. |
| Função | Comunicar mudança de contexto mantendo a relação com a tela de origem. |
| Emoção esperada | Orientação e continuidade, como hipótese. |
| Benefício | Indica a entrada de uma camada de interação. |
| Risco | Deslocamentos amplos podem causar desconforto e atrasar navegação repetitiva. |
| Decisão técnica | `Modal animationType="slide"`. Duração e curva são delegadas à implementação da plataforma; não se atribui um número não configurado pelo projeto. |
| Movimento reduzido | Usa `animationType="none"`; controles, conteúdo e retorno continuam disponíveis. |
| Evidência externa | NÃO EXECUTADA — não houve P1/P2 externos. |

## 3.4 Animação 4 - Fade de conteúdo sobreposto

| Campo | Registro |
|---|---|
| Nome e localização | Fade no catálogo de conquistas; `src/screens/ProfileScreen.tsx`. Também usado em textos legais e confirmação de exclusão. |
| Gatilho | Abrir ou fechar o modal correspondente. |
| Função | Revelar o conteúdo e o fundo escurecido sem deslocar a tela principal. |
| Emoção esperada | Suavidade e atenção, como hipótese. |
| Benefício | Torna a camada ativa perceptível e mantém contexto visual. |
| Risco | Uma aparição muito discreta pode passar despercebida. |
| Decisão técnica | `Modal animationType="fade"`, com opacidade gerenciada pela plataforma. Duração e easing não são parametrizados pelo aplicativo. |
| Movimento reduzido | Usa `animationType="none"`; título, conteúdo e fechamento permanecem. |
| Evidência externa | NÃO EXECUTADA — não houve P1/P2 externos. |

## 3.5 Animação 5 - escala do ícone de conclusão

| Campo | Registro |
|---|---|
| Nome e localização | Escala do checkmark da tarefa na Home, em `src/screens/HomeScreen.tsx`. |
| Gatilho | Resposta de sucesso ao concluir uma tarefa. |
| Função | Confirmar localmente a mudança de estado solicitada. |
| Emoção esperada | Segurança e resposta imediata, como hipótese. |
| Benefício | O efeito está junto do item acionado e reforça a mudança do ícone. |
| Risco | Repetição rápida poderia distrair; por isso o fluxo bloqueia ações sobrepostas. |
| Decisão técnica | Scale + Fade: escala e opacidade de 0,6 para 1 em 180 ms, `Easing.out(Easing.cubic)` e `useNativeDriver: true`. A desaceleração estabiliza o ícone no tamanho final. |
| Movimento reduzido | Define a escala diretamente em 1. O ícone de checkmark e o estado da tarefa permanecem visíveis. |
| Evidência externa | NÃO EXECUTADA — não houve P1/P2 externos. |

## 3.6 Cobertura dos requisitos de movimento

| Requisito | Evidência escolhida |
|---|---|
| Resposta à ação | Shake de erro e checkmark de conclusão |
| Indicação de progresso | Barra, anel e contador |
| Mudança de estado ou navegação | Slide dos painéis e alteração do ícone de tarefa |
| Duas escolhas adicionais | Fade de modal e Scale do checkmark |

O laboratório da aula apresenta Fade, Slide, Scale, Easing, Spring/Bounce, Ripple, Loading/Progresso e Shake [2]. Easing é documentado como curva temporal, não como uma sexta animação isolada. Spring/Bounce, Ripple e Parallax não foram necessários ao fluxo escolhido. Barra, anel e contador são agrupados como animação de dados; não são contados como três tipos independentes para completar o mínimo.

<!-- pagebreak -->

# 4 TRECHOS DE CÓDIGO COMENTADOS

## 4.1 Estrutura JSX - equivalente à responsabilidade do HTML

Arquivo: `src/screens/HomeScreen.tsx`.

```tsx
<ProgressRing progress={tasksProgress} size={150} strokeWidth={14}>
  {/* Valor textual preserva a informação sem depender do movimento. */}
  <Text style={styles.ringValue}>
    {displayTasksDone}/{tasksTotal}
  </Text>
  <Text style={styles.ringLabel}>{t('home.tasks')}</Text>
</ProgressRing>
```

O componente organiza a informação visual e textual. `progress` recebe uma razão entre 0 e 1; os filhos exibem parte e total. Em React Native não há uma tag HTML `progress`, mas a responsabilidade estrutural e semântica é exercida pelos componentes e propriedades acessíveis.

## 4.2 Apresentação e movimento - equivalente à responsabilidade do CSS

Arquivo: `src/components/ProgressBar.tsx`.

```tsx
animatedProgress.stopAnimation();
if (reduceMotion) {
  // Acessibilidade: aplica o estado final sem transição.
  animatedProgress.setValue(clamped);
  return;
}

const animation = Animated.timing(animatedProgress, {
  toValue: clamped,      // destino entre 0 e 1
  duration: 300,         // duração final adotada
  easing: Easing.out(Easing.cubic), // desacelera na chegada
  useNativeDriver: false // largura não usa native driver
});
animation.start();
```

`Animated.timing` cumpre o papel que uma `transition` teria na Web. A largura interpolada é aplicada ao preenchimento, enquanto a preferência de movimento reduzido elimina a transição sem remover o estado final.

## 4.3 Evento e mudança de estado - equivalente à responsabilidade do JavaScript

Arquivo: `src/screens/HomeScreen.tsx`.

```tsx
const result = await toggleTask(id); // envia a ação pelo hook

if (result.ok && result.data.done) {
  checkmarkScale.setValue(0.6);       // estado inicial do feedback
  if (reduceMotion) {
    checkmarkScale.setValue(1);       // alternativa sem movimento
  } else {
    Animated.timing(checkmarkScale, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }
}
```

O evento não anima antes de o backend confirmar sucesso. Isso reduz falsos positivos visuais. O handler também impede ações sobrepostas durante a atualização.

<!-- pagebreak -->

# 5 COMPARAÇÃO DE DURAÇÃO E CURVA

## 5.1 Fato implementado

As durações atuais são 180 ms para o checkmark, 300 ms para a barra, 320 ms para o anel e contador e 320 ms no total para o shake. As transições de dados e o checkmark usam `Easing.out(Easing.cubic)`: a alteração começa mais rápida e desacelera ao se aproximar do destino. No shake, segmentos lineares alternam a direção e a última etapa desacelera. Essas são decisões técnicas provisórias, justificadas por feedback curto e legibilidade do estado final. Como P1/P2 externos não foram avaliados, esta entrega não confirma preferência, conforto ou clareza percebida.

## 5.2 Protocolo rápido/lento - ainda não executado

| Elemento | Versão rápida | Versão lenta | Versão atual | Campo de resultado |
|---|---:|---:|---:|---|
| Checkmark | 120 ms | 360 ms | 180 ms | NÃO EXECUTADO com pessoas externas. |
| Barra de progresso | 180 ms | 600 ms | 300 ms | NÃO EXECUTADO com pessoas externas. |

Procedimento proposto:

1. Manter conteúdo, dispositivo e tarefa iguais.
2. Mostrar as duas durações em ordem alternada entre P1 e P2.
3. Perguntar qual versão deixou a mudança mais clara e se alguma pareceu lenta ou abrupta.
4. Registrar a fala por paráfrase fiel, sem atribuir emoção não declarada.
5. Justificar a configuração final somente após os dados reais.

> **Estado em 17/11:** o comparador didático `comparacao-motion.html` implementa as duas durações, com a mesma curva cúbica e controle de movimento reduzido. Ele usa valores simulados, sem alterar dados do aplicativo. A apresentação a participantes externos **não foi executada**; logo, não há preferência ou justificativa atribuível a P1/P2.

<!-- pagebreak -->

# 6 ACESSIBILIDADE E CUIDADOS DE IMPLEMENTAÇÃO

## 6.1 Redução de movimento

O `MotionProvider` consulta `AccessibilityInfo.isReduceMotionEnabled()`, acompanha `reduceMotionChanged` e carrega a preferência manual persistida no AsyncStorage. O hook `useReducedMotion` disponibiliza a decisão compartilhada. Barra, anel, contador e checkmark aplicam o estado final imediatamente; o shake mantém o anúncio acessível.

O controle **Reduzir movimentos** está nas Preferências, acessíveis antes do login e pelo Perfil. A redução é ativada quando a preferência manual OU a do sistema está ativa. Quando o sistema solicita redução, a interface explica essa condição e não permite anulá-la. Modais usam `none`, rolagem programática elimina animação e a navegação nativa também respeita a preferência. A persistência manual foi verificada tecnicamente no navegador após recarregamento.

## 6.2 Informação preservada sem animação

- O shake acompanha mensagem de erro e anúncio por acessibilidade.
- O anel inclui contagem textual.
- A barra é acompanhada por percentual ou estado da meta.
- O checkmark continua visível após o movimento.
- Operações assíncronas possuem texto, ícone ou indicador e controles desabilitados.

## 6.3 Outros critérios

| Critério | Estado em 16/11/2026 |
|---|---|
| Rótulos e botões identificados | Implementado em fluxos principais por texto e propriedades de acessibilidade. |
| Ações sobrepostas | Bloqueadas em handlers principais durante requisições. |
| Contraste/tema | Texto secundário e indicadores de progresso ajustados após revisão técnica; não constitui auditoria WCAG integral. |
| Teclado e foco visível | Foco Web com contorno de 3 px e acesso ao último controle com zoom CSS de 200% confirmados em 17/11; leitor de tela real não executado. |
| Tela estreita | Validação interna Android registrada; evidência externa pendente. |
| Tela larga | Captura técnica em viewport 1280 px; validação humana permanece necessária. |
| Arrastar e soltar | Não utilizado; não exige alternativa. |

## 6.4 Checklist de acessibilidade para a sessão externa

- Confirmar mensagem compreensível com animação normal.
- Ativar redução de movimento no sistema.
- Repetir a conclusão de tarefa.
- Confirmar que texto e ícone continuam comunicando o resultado.
- Perguntar se houve desconforto, atraso percebido ou perda de entendimento.
- Registrar dispositivo, largura aproximada e configuração usada.

<!-- pagebreak -->

# 7 MÉTODO DO TESTE COM PESSOAS EXTERNAS

## 7.1 Participantes e ética mínima

Devem participar pelo menos duas pessoas que não integrem a equipe. Elas serão identificadas apenas como P1 e P2. Não serão registrados nome, matrícula, e-mail ou outros dados pessoais desnecessários. Antes de capturar tela, áudio ou vídeo, a equipe deve informar a finalidade acadêmica e obter concordância.

**Situação em 17/11/2026:** não haverá recrutamento externo nesta rodada, conforme decisão informada pela equipe. O método abaixo permanece como proposta não executada. A alternativa operacional está em `casos-testes.md`, destinada à equipe, sem equivalência com avaliação externa.

| Campo | P1 | P2 |
|---|---|---|
| Confirmação de pessoa externa | NÃO EXECUTADO | NÃO EXECUTADO |
| Data e horário | Não se aplica | Não se aplica |
| Dispositivo/sistema | Não se aplica | Não se aplica |
| Largura/orientação | Não se aplica | Não se aplica |
| Concordância com registro | Não se aplica | Não se aplica |

## 7.2 Orientação ao moderador

O moderador lê somente o objetivo da tarefa. Não aponta onde tocar e não demonstra o caminho. Se o participante pedir ajuda, registra o momento e oferece a menor pista possível. As perguntas sobre sensação são feitas depois da tentativa para evitar indução.

## 7.3 Três tarefas

### Tarefa 1 - criar e concluir uma tarefa

> “Crie uma tarefa chamada ‘Revisar conteúdo de IHC’ para hoje e marque-a como concluída. Depois, diga o que mudou na tela.”

Critérios observáveis: encontrou o CTA; preencheu e salvou; identificou a tarefa; concluiu; percebeu ícone, contador e progresso.

### Tarefa 2 - realizar o check-in

> “Registre o check-in de estudo de hoje e explique como o aplicativo informou que estava processando e que terminou.”

Critérios observáveis: localizou a ação; evitou toque repetido; identificou loading/estado; percebeu resultado ou mensagem de conflito caso o check-in já exista.

### Tarefa 3 - criar uma meta

> “Crie uma meta chamada ‘Estudar animações’ com duração de sete dias e localize o progresso dessa meta.”

Critérios observáveis: encontrou Goals; abriu formulário; preencheu título/duração; salvou; localizou a nova meta e sua barra.

## 7.4 Repetição com movimento reduzido

Ativar a preferência de redução de movimento no sistema. Criar outra tarefa equivalente e repetir a conclusão. Perguntar:

- A mudança continuou compreensível?
- O que indicou que a tarefa foi concluída?
- A versão com menos movimento pareceu melhor, pior ou equivalente? Por quê?

## 7.5 Registro por participante

Caso futuramente haja participantes externos, usar `roteiro-testes.md`. Cada participante gera quatro registros: três tarefas normais e a repetição reduzida. Para cada tentativa registrar conclusão sem ajuda/com ajuda/não concluída, dificuldade observável, sensação relatada, sugestão e referência da evidência.

<!-- pagebreak -->

# 8 RESULTADOS DE P1 E P2

## 8.1 Situação da avaliação externa

**NÃO EXECUTADO — REQUISITO NÃO ATENDIDO.** Nenhuma pessoa externa à equipe participou de uma sessão. Consequentemente, não existem registros de conclusão, ajuda, dificuldade observada, sensação relatada, sugestão, preferência de duração ou evidência de P1/P2.

Contas locais identificadas como `p1.demo` e `p2.demo`, quando usadas na validação técnica, são fixtures sintéticas. Elas não representam pessoas e seus resultados não podem preencher esta seção.

## 8.2 Limite de interpretação

Sem sessões externas, não é possível comparar P1 e P2, afirmar que um movimento foi percebido como útil, avaliar desconforto ou concluir que a versão reduzida foi compreendida por usuários. Os resultados internos e automatizados demonstram funcionamento técnico, mas não fornecem evidência de usabilidade externa.

<!-- pagebreak -->

# 9 DUAS MELHORIAS APÓS OS TESTES

As duas melhorias obrigatórias deveriam ser escolhidas a partir de achados de P1/P2. Como a avaliação externa não foi executada, esse requisito **NÃO FOI ATENDIDO**. O commit `64ac832` contém correções derivadas de validação interna — foco/rolagem no formulário de tarefa, alinhamento do checkbox de termos e localização do conflito de check-in —, mas elas não são apresentadas como melhorias produzidas por participantes externos.

## 9.1 Melhoria 1

**NÃO EXECUTADA.** Não houve achado externo que autorizasse atribuir uma primeira melhoria a P1 ou P2.

## 9.2 Melhoria 2

**NÃO EXECUTADA.** Não houve achado externo que autorizasse atribuir uma segunda melhoria a P1 ou P2.

## 9.3 Padrão das figuras antes/depois

O padrão abaixo fica registrado apenas como referência para uma avaliação futura; nenhuma dupla de figuras é atribuída a P1/P2 nesta entrega.

- Figura N-a - estado antes, mesma tela e mesmo conteúdo.
- Figura N-b - estado depois, mesma escala e orientação.
- Legenda deve explicar a diferença observável sem usar somente “melhor”.
- Informar a tarefa e o achado que motivou a mudança.

<!-- pagebreak -->

## 9.4 Validação técnica interna por agente em 17/11

A rodada foi executada por Codex, agente automatizado de QA, em contas sintéticas locais. Não foi uma sessão humana nem avaliação externa. O browser real Edge/Chromium 157.0.4341.60 executou a aplicação exportada; scripts HTTP e SQL complementaram a observação. Foram produzidas capturas e vídeos WebM.

**Resultado: 7 casos aprovados no escopo Web, 4 reprovados e 2 bloqueados.**

| Caso | Resultado |
|---|---|
| CT-01 | APROVADO — Web |
| CT-02 | APROVADO — Web |
| CT-03 | APROVADO — Web |
| CT-04 | APROVADO — Web |
| CT-05 | APROVADO — emulação Web |
| CT-06 | APROVADO — Web |
| CT-07 | BLOQUEADO — parcial |
| CT-08 | REPROVADO |
| CT-09 | REPROVADO |
| CT-10 | REPROVADO |
| CT-11 | APROVADO — local |
| CT-12 | REPROVADO |
| CT-13 | BLOQUEADO — ambiente |

Falhas confirmadas: arquivar meta e sair de grupo não abrem confirmação Web; credenciais inválidas retornam HTTP 400 sem mensagem visível nos três idiomas; orientação do estado vazio aponta incorretamente para a aba de metas. A exclusão está bloqueada pela ausência da rota da Edge Function no Compose (HTTP 404). A suíte SQL de cascata não substitui esse teste.

Foco visível e acesso ao último controle com CSS zoom 200% foram confirmados. Movimento reduzido foi testado no app e por media query emulada; nenhum Android estava conectado. Não houve leitor de tela real com áudio nem envio de convite por aplicativo externo.

Os registros completos, retestes e limites estão em `evidencias/qa17/RESUMO-QA.md`; resultados estruturados em `ui-results.json`, `supplement-results.json`, `final-results.json` e `backend-results.json`. A execução não alterou arquivos de produção, não realizou reset do banco e não publicou correções.

# 10 CONTRIBUIÇÕES INDIVIDUAIS

O histórico do repositório sustenta parte das contribuições. A equipe deve revisar esta seção antes da entrega e confirmar trabalho de teste, análise e redação realizado após 16/11.

| Integrante | Contribuição sustentada pelo histórico | Complemento a confirmar |
|---|---|---|
| Joseph Bartholomeu Cavalcante Rocha | Estrutura do aplicativo, design inicial, Supabase/RLS/RPCs, serviços e hooks, integrações de tarefas/check-in/metas/grupos, progressão, animações acessíveis, CI e infraestrutura local. | [PENDENTE - confirmar participação nos testes, análise e fechamento do relatório] |
| Letícya Beatryz dos Santos Medeiros | Componentes e fluxos de login/cadastro, validações, navegação inicial, termos, atualização Expo, internacionalização PT/EN/ES e tema escuro persistente. | [PENDENTE - confirmar participação nos testes, análise e revisão do relatório] |
| Mariana Pereira de Melo | O histórico comprova revisão/merge da PR #1 de interatividade. | [PENDENTE - descrever somente contribuições realmente executadas em testes, análise, evidências ou redação] |

Nenhuma contribuição deve ser atribuída apenas para equilibrar a tabela. O texto final deve refletir atividades efetivamente realizadas.

# 11 LIMITAÇÕES E PRÓXIMOS AJUSTES

1. A avaliação com duas pessoas externas não foi realizada; o requisito acadêmico correspondente não foi atendido.
2. Não há resultados externos para justificar preferência entre as versões rápida e lenta.
3. Não foram implementadas duas melhorias derivadas de achados externos; correções de auditoria interna não substituem esse requisito.
4. A validação técnica interna e as contas-fixture não permitem inferir clareza, conforto, emoção ou usabilidade percebida.
5. Permanecem como trabalho futuro uma avaliação externa ética, a comparação observacional das durações e a revalidação de eventuais melhorias.
6. A rodada interna foi consolidada em 17/11 com capturas, vídeos e resultados. Permanecem falhas Web confirmadas, função de exclusão indisponível, validação Android e leitor de tela real não executados; corrigir e revalidar antes de declarar o app aprovado integralmente.

# 12 CONCLUSÃO

O StudyPulse possui um fluxo principal funcional e movimentos curtos associados a feedback, progresso e mudança de estado. A implementação preserva texto ou ícone quando a animação é removida e consulta a preferência de movimento reduzido do sistema. A análise técnica sustenta a existência e a finalidade proposta de cinco efeitos reais, mas não comprova benefício percebido por usuários externos.

Esta entrega registra com transparência que P1/P2 não foram executados e que as duas melhorias obrigatórias derivadas dessas sessões não foram produzidas. Assim, as hipóteses emocionais permanecem hipóteses da equipe, e a validação interna é apresentada somente como evidência funcional e técnica, sem equivalência com teste de usabilidade. O requisito de participantes externos permanece **NÃO ATENDIDO**.

<!-- pagebreak -->

# REFERÊNCIAS

[1] FERREIRA, Icaro. **Projeto de IHC: interface, animação e experiência - guia de entrega**. AFYA/UNIMA Maceió, 2026. Material de disciplina fornecido em PDF.

[2] FERREIRA, Icaro. **Laboratório de animações na IHC**. AFYA/UNIMA Maceió, 2026. Material didático em HTML, consultado em 16 nov. 2026.

[3] META PLATFORMS, INC. **AccessibilityInfo**. React Native Documentation. Disponível em: <https://reactnative.dev/docs/accessibilityinfo>. Acesso em: 16 nov. 2026.

[4] META PLATFORMS, INC. **Animated**. React Native Documentation. Disponível em: <https://reactnative.dev/docs/animated>. Acesso em: 16 nov. 2026.

[5] WORLD WIDE WEB CONSORTIUM. **Understanding Success Criterion 2.3.3: Animation from Interactions**. WCAG 2.2. Disponível em: <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html>. Acesso em: 16 nov. 2026.

[6] WORLD WIDE WEB CONSORTIUM. **Understanding Success Criterion 4.1.3: Status Messages**. WCAG 2.2. Disponível em: <https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html>. Acesso em: 16 nov. 2026.

[7] STUDYPULSE. **Repositório do projeto**. GitHub, 2026. Disponível em: <https://github.com/usrJosephC/StudyPulse>. Acesso em: 16 nov. 2026.

[8] UNIVERSIDADE DE BRASÍLIA. Biblioteca Central. **Normalização ABNT atualizada em fevereiro de 2025**. Disponível em: <https://bce.unb.br/wp-content/uploads/2025/02/ABNT-ATUALIZADO-em-fevereiro-2025.pdf>. Acesso em: 16 nov. 2026.

[9] IEEE. **Authoring tools and templates**. IEEE Author Center Conferences. Disponível em: <https://conferences.ieeeauthorcenter.ieee.org/write-your-paper/authoring-tools-and-templates/>. Acesso em: 16 nov. 2026.

# APÊNDICE A - MATRIZ DE EVIDÊNCIAS

## Validação técnica local em 17/11/2026

Na cópia de trabalho de `feat/sprint-priorities`, baseada em `21129f2` e ainda com alterações locais, passaram: typecheck, 5 testes do aplicativo, 138 verificações CORS e 104 assertions SQL em sete suítes com ROLLBACK. A exportação Expo Web também passou. O lint terminou com zero erros e 11 avisos preexistentes. Esses resultados são verificações locais, não um novo resultado de CI remoto.

A revisão do banco motivou a migration 009: tabelas de progressão conservam leitura autorizada por RLS e perdem permissões de escrita direta do cliente. As contas locais de demonstração foram preparadas sem check-in inicial. Login, criação/conclusão de tarefa, check-in, criação de meta e persistência da preferência de movimento foram exercitados tecnicamente no navegador em 16/11, sem participantes externos.

As correções de CORS, contraste e movimento reduzido são melhorias derivadas de auditoria técnica. Não são apresentadas como as duas melhorias obrigatórias derivadas de P1/P2.

Na instalação a partir do ZIP, a exportação comum compilou, mas omitiu as variáveis de API do JavaScript final. A correção operacional foi criar `npm run export:web`, que inicia o Expo com `.env` já carregado e limpa o cache. O bundle regenerado contém a URL pública local esperada. Esse achado reforça a necessidade de testar a aplicação exportada, além de verificar apenas o código de saída do compilador.

| Evidência | Situação | Local esperado |
|---|---|---|
| Código das cinco animações | Existente | Repositório StudyPulse |
| CI e validações automatizadas | Existente | PR #30 / GitHub Actions |
| Capturas técnicas das telas | Incluídas ao final do PDF; não substituem P1/P2 | `evidencias/tecnicas/` |
| Registros de P1 | Pendente | `evidencias/p1/` |
| Registros de P2 | Pendente | `evidencias/p2/` |
| Comparação rápida/lenta | Execução técnica aprovada; preferência humana não avaliada | `evidencias/qa17/comparator-timing.json` |
| Duas melhorias antes/depois | Pendente | figuras e commits posteriores |

# APÊNDICE B - CHECKLIST DE FECHAMENTO

- [ ] Informar turma.
- [ ] Confirmar contribuições finais dos três integrantes.
- [ ] Executar P1 externo.
- [ ] Executar P2 externo.
- [ ] Repetir tarefa com redução de movimento para ambos.
- [x] Executar comparação rápida/lenta tecnicamente; avaliação humana não realizada.
- [ ] Implementar duas melhorias derivadas dos testes.
- [ ] Inserir capturas antes/depois.
- [x] Inserir evidências técnicas; capturas no PDF e vídeos em `evidencias/qa17/`.
- [x] Revisar contraste e foco Web; limites de Android/leitor de tela registrados no CT-07.
- [x] Regenerar HTML e PDF com resultados técnicos de 17/11.
- [x] Revisar visualmente as páginas renderizadas; manter pendências acadêmicas explícitas.
- [x] Gerar versão anterior do ZIP sem `node_modules`, caches, credenciais e temporários.
- [x] Extrair versão anterior e testar instalação, exportação e aplicação; rodada de QA encontrou falhas descritas na seção 9.4.
- [ ] Atualizar pacote final após correções e revalidar cenários reprovados.

<!-- pagebreak -->

# APÊNDICE C - ROTEIRO DE TESTE COM PARTICIPANTES

O roteiro completo está incluído neste relatório para consulta independente. A fonte editável é `roteiro-testes.md`, também fornecida no ZIP. Este apêndice documenta o planejamento; as sessões externas não foram realizadas.

<!-- include: roteiro-testes.md -->

<!-- pagebreak -->

# APÊNDICE D - CASOS E RESULTADOS DA VALIDAÇÃO INTERNA

Os treze casos abaixo registram a execução técnica de 17/11/2026, com resultados, falhas e limites. A fonte editável é `casos-testes.md`, também fornecida no ZIP. Os arquivos de evidência referenciados acompanham o pacote em `entrega-ihc/evidencias/qa17/`.

<!-- include: casos-testes.md -->
