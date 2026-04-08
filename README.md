# Escala Instagram

Protótipo de sistema de escala de horário para repost de sábado.

## Funcionalidades

- Escala automática do time em sábados do mês.
- Alternância automática sem repetir a mesma pessoa em semanas consecutivas.
- Visualização em estilo calendário preto e branco, com marcação estética e jovem.
- Status de ponto via Secullum:
  - Verde: bateu ponto no horário previsto (11h às 12h)
  - Laranja: bateu ponto fora do horário
  - Vermelho: escalada e não marcou presença
- Painel de ajustes para trocar a pessoa escalada ou corrigir status em um sábado específico.
- Botão `Gerar nova escala` para recalcular ciclos e `Exportar PDF` para compartilhar.

## Como usar

1. Abra `index.html` em um navegador.
2. Veja o calendário do mês atual e as escalas de sábado.
3. Edite os nomes do time diretamente no painel lateral.
4. Use `Gerar nova escala` para recalcular a sequência.
5. Ajuste a escala de um sábado específico no cartão de ajuste.
6. Use `Exportar PDF` para gerar o layout para WhatsApp.

## Arquivos

- `index.html` - página principal.
- `styles.css` - estilos preto e branco.
- `script.js` - lógica de escala, marcação de ponto e exportação PDF.
