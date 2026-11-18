# StudyPulse — Projeto, equipe e links

Este documento concentra as informações institucionais e os acessos externos do StudyPulse. A documentação técnica e os comandos de desenvolvimento estão no [README principal](README.md).

## Tema

Aplicativo de rotina de estudos com gamificação, desenvolvido para a disciplina de **Interação Humano-Computador (IHC)**. A experiência combina organização pessoal, acompanhamento de consistência e colaboração entre estudantes.

## Equipe

| Integrante |
|---|
| Joseph Bartholomeu Cavalcante Rocha |
| Letícya Beatryz dos Santos Medeiros |
| Mariana Pereira de Melo |

## Links do projeto

| Recurso | Acesso |
|---|---|
| Repositório | [GitHub — StudyPulse](https://github.com/usrJosephC/StudyPulse) |
| Design e protótipo | [Figma — StudyPulse](https://www.figma.com/design/LwbfI3P6NLJ5qugXShJtVE/StudyPulse?node-id=0-1&t=nitCGBD94poPS6Qy-1) |
| Gestão da Sprint | [Trello — StudyPulse](https://trello.com/invite/b/6a853b12c9d53cd6f5a14e85/ATTI9822d432ba7e1624ada1d65fb3110c6a530C5AC4/studypulse) |
| Última promoção para main | [PR #39 - atualizar README, informações do projeto e relatório final](https://github.com/usrJosephC/StudyPulse/pull/39), integrada em 18/11/2026 |
| Implementação recente | [PR #36 — movimento acessível, CORS, SQL e documentação](https://github.com/usrJosephC/StudyPulse/pull/36) |
| Entrega de IHC | 18 de novembro de 2026 — StudyPulse com Expo/React Native e versão web |

## Proposta

O StudyPulse busca tornar a rotina de estudos mais clara e motivadora. Tarefas e metas representam o planejamento; streak, heatmap e pontos dão retorno sobre consistência; grupos, ranking e feed aproximam colegas que estudam com objetivos semelhantes.

## Estado do projeto

O projeto inclui tarefas e check-in diário, metas com histórico e restauração, grupos com convites e permissões, perfil e preferências, dez conquistas e feedback animado. A PR #30 reuniu os fluxos funcionais; a PR #36 adicionou preferência interna de movimento reduzido, adaptação de modais, foco e contraste, correções de CORS local e restrições SQL da migration 009. Esse conjunto já está na `main` desde a integração da PR #37 em 18/11/2026.

A entrega oficial utiliza Expo/React Native/TypeScript, com explicação da correspondência entre JSX e estrutura HTML, StyleSheet/Animated e apresentação, eventos e JavaScript. O relatório principal, roteiro e casos detalhados são documentos separados. As contribuições individuais foram confirmadas por Joseph em 18/11; o campo Turma foi removido, mantendo a identificação da disciplina IHC.

## Validação e limitações

Typecheck, cinco testes da aplicação, 138 verificações CORS e 104 assertions SQL passaram na rodada registrada. Lint: zero erros e 11 avisos. O QA técnico Web teve sete casos aprovados, quatro reprovados e dois bloqueados; Joseph confirmou no Chrome os mesmos erros encontrados pelo agente no Edge.

As pendências abrangem feedback de credenciais inválidas, confirmações de saída de grupo e arquivamento de meta na Web, orientação do estado vazio de tarefas e disponibilidade da função de exclusão de conta no ambiente local. Android, leitor de tela real e compartilhamento externo requerem nova validação. Consulte o [resumo do QA](entrega-ihc/evidencias/qa17/RESUMO-QA.md).

A avaliação com duas pessoas externas e as melhorias decorrentes dessas sessões não foram realizadas. Os testes internos não são apresentados como substitutos de avaliação de usabilidade externa.

## Contribuições confirmadas

| Integrante | Participação |
|---|---|
| Joseph Bartholomeu Cavalcante Rocha | Estrutura e design inicial, backend e segurança, serviços/hooks, integrações, progressão, animações, CI e infraestrutura; testes, análise e fechamento do relatório. |
| Letícya Beatryz dos Santos Medeiros | Implementação de login/cadastro, validações, navegação inicial, termos, atualização Expo, idiomas e tema, compartilhada com Mariana; revisão do relatório. |
| Mariana Pereira de Melo | Implementação compartilhada com Letícya nos mesmos fluxos e recursos; revisão de interatividade e do relatório. |

As atribuições acima foram confirmadas por Joseph; o apoio automatizado à validação está identificado no relatório.

## Documentos relacionados

- [README técnico e execução local](README.md)
- [Configuração local do Supabase](study-pulse-app/supabase/README.md)
- [Relatório e roteiro de testes](entrega-ihc/LEIA-ME.md)
