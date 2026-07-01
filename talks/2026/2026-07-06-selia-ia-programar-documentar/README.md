# Inteligencia artificial: programar, documentar y no acabar en un berenjenal

> Decisiones trazables (ADRs), IA agnóstica y software libre — con mod_exelearning como caso real.

Charla corta (~20 min) + stand en la **I Jornada sobre Software Libre e Inteligencia
Artificial Abierta (seLIA)** — lunes 6 de julio de 2026.

- Metadatos: [`talk.yml`](talk.yml)
- Contenido (fuente de verdad): [`../../../scripts/exe/specs/2026-07-06-selia-ia-programar-documentar.json`](../../../scripts/exe/specs/2026-07-06-selia-ia-programar-documentar.json)
- Notas del ponente: [`notes.md`](notes.md)
- Unidad renderizada (eXeLearning, tema nova): [`index.html`](index.html)
- Propuesta:
  <https://codeberg.org/seLIA/Contrib/src/branch/main/propuestas/27_Ernesto_Serrano-La_IA_puede_programar.md>

## Generar localmente

```bash
# Regenerar la unidad eXeLearning desde el spec (paso local):
#   requiere python3 + `pip install markdown` y la CLI eXeLearning en $EXE_DIR
make exe        # renderiza scripts/exe/specs/*.json en las carpetas de cada charla
make build      # valida metadatos y genera la web en output/site/
make serve      # vista previa en http://localhost:8080
```
