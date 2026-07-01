# Herramientas de desarrollo, CI e IA

> Mi caja de herramientas real: shell y utilidades, IA (MCP, skills, ADRs) y CI con Make + GitHub Actions.

Charla práctica para **3ipunt** — viernes 3 de julio de 2026 (~60 min). Recorrido
tool-by-tool por mi entorno de trabajo real, en tres bloques: **Herramientas**, **IA** y **CI**.

- Metadatos: [`talk.yml`](talk.yml)
- Contenido (fuente de verdad): [`../../../scripts/exe/specs/2026-07-03-3ipunt-dev-tools-ci-ai.json`](../../../scripts/exe/specs/2026-07-03-3ipunt-dev-tools-ci-ai.json)
- Notas del ponente: [`notes.md`](notes.md)
- Unidad renderizada (eXeLearning): [`index.html`](index.html)

## Generar localmente

```bash
# Regenerar la unidad eXeLearning desde el spec (paso local):
#   requiere python3 + `pip install markdown` y la CLI eXeLearning en $EXE_DIR
make exe        # renderiza scripts/exe/specs/*.json en las carpetas de cada charla
make build      # valida metadatos y genera la web en output/site/
make serve      # vista previa en http://localhost:8080
```
