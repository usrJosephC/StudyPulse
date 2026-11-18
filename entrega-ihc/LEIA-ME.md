# Entrega StudyPulse — 18 de novembro de 2026

O StudyPulse é a entrega oficial. Expo/React Native/TypeScript são explicados no relatório como implementação das responsabilidades de estrutura, apresentação e comportamento. `atividadeAnimacoes` não faz parte do pacote.

## Material

**Situação em 18/11:** QA interno no Edge executado por agente: 7 casos aprovados, 4 reprovados e 2 bloqueados. Joseph confirmou os mesmos erros em testes no Chrome. Evidências automatizadas, capturas e vídeos estão em `evidencias/qa17/`. O aplicativo ainda não está aprovado integralmente. Não houve participantes externos; esse requisito permanece não atendido. Contribuições individuais confirmadas por Joseph em 18/11.

- `RelatorioIHC_StudyPulse.pdf`: relatório principal com método, síntese dos resultados e contribuições individuais; roteiro e casos detalhados são documentos separados.
- `relatorio.md`: fonte editável do relatório.
- `casos-testes.md` e `CasosTestes_StudyPulse.pdf`: 13 casos preenchidos com resultados observados, divergências e referências às evidências.
- `RoteiroTestes_StudyPulse.pdf` e `roteiro-testes.md`: instruções e fichas P1/P2.
- `comparacao-motion.html`: comparação didática rápida/lenta, abre no navegador sem API.
- `evidencias/tecnicas/`: capturas de testes técnicos, não de participantes humanos.
- `gerar-relatorio.py`: geração reproduzível dos PDFs a partir de Markdown.

O ZIP reúne três documentos separados (relatório principal, roteiro e casos de teste), fontes Markdown/HTML, comparador de animações, evidências (capturas, vídeos e logs), código e instruções de execução. Não inclui dependências instaladas, caches ou `.env` privado. As pendências técnicas e acadêmicas continuam registradas; empacotar não significa aprovação integral.

## Execução local do aplicativo

Abra a raiz extraída do ZIP no VSCode e o terminal em `study-pulse-app`:

```powershell
npm ci
Copy-Item .env.example .env
docker-compose up -d
docker-compose run --rm migrations
docker-compose exec -T gateway nginx -t
docker-compose exec -T gateway nginx -s reload
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/seed-local-demo.ps1
npm run web
```

Copie `.env.example` somente se ainda não existir `.env`. Docker Desktop deve estar disponível. A API local atende em `http://localhost:54321`. No navegador abra o endereço exibido pelo Expo, normalmente `http://localhost:8081`. Para celular físico, use `npm run start:local`; computador e celular precisam estar na mesma rede. Mantenha Expo SDK 57.

## Contas locais de teste

| Uso | E-mail | Senha |
|---|---|---|
| P1 externo | p1.demo@studypulse.local | StudyPulseP1!2026 |
| P2 externo | p2.demo@studypulse.local | StudyPulseP2!2026 |

São credenciais públicas de demonstração **somente do backend local**, sem dados pessoais e sem privilégios administrativos. O script cria tarefas, metas e um grupo com P1 como criador e P2 como membro. Não cria check-in por padrão, para preservar a tarefa do roteiro. Reexecutar não deve duplicar as fixtures. Não usar essas senhas em produção. Contas `qa1.demo`/`qa2.demo` são reservadas para validação técnica e não contam como participantes.

## Verificação técnica

```powershell
npm run typecheck
npm test
npm run lint
node scripts/test-local-cors.mjs
node scripts/test-local-sql.mjs
npm run export:web
```

O teste CORS requer a API local. Valide também pelo navegador login, criação/conclusão de tarefa e check-in. Um teste HTTP isolado não aplica as regras CORS do navegador.

Para exportar, use Node 20.12 ou superior e o script `export:web` com `.env` já configurado. Ele carrega as variáveis antes de iniciar o Expo e limpa o cache de transformação. Na verificação de instalação limpa, a exportação comum terminou sem erro, mas incorporou valores ausentes para o Supabase; por isso somente o sucesso do bundler não foi considerado suficiente. Sirva `dist` por HTTP e confirme o login após exportar. Nunca coloque chaves secretas/service-role em variáveis `EXPO_PUBLIC_*`.

## Relatório e ZIP

Para regenerar PDFs, instale as dependências de documentação fora das dependências do app:

```powershell
py -m pip install --user reportlab markdown beautifulsoup4 pymupdf
py ../entrega-ihc/gerar-relatorio.py
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-delivery.ps1 -OutputPath C:/caminho/ProjetoIHC_StudyPulse.zip
```

O ZIP é uma fotografia dos arquivos atuais e inclui `MANIFESTO_ENTREGA.json` com hashes, commit de base e indicação de mudanças locais. Exclui `.env`, caches, dependências e contexto privado. O script preserva pacotes existentes: use outro caminho se já existir um ZIP.

Antes de enviar, conferir os três PDFs e o ZIP extraído. A ausência de P1/P2 e das melhorias decorrentes dessa avaliação permanece registrada como limitação. Os casos reprovados ou bloqueados precisam de correção e revalidação antes de declarar aprovação integral do aplicativo.
