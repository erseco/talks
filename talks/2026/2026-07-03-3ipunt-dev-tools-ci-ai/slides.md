---
theme: seriph
layout: cover
class: text-center
title: "Herramientas de desarrollo, CI e IA"
info: |
  Del editor al pipeline: cómo trabajar mejor sin delegar el criterio.
  Charla para 3ipunt sobre herramientas modernas de desarrollo, integración
  continua e IA aplicada al ciclo de vida del software.
author: "Ernesto Serrano"
transition: slide-left
mdc: true
---

# Herramientas de desarrollo, CI e IA

### Del editor al pipeline: trabajar mejor sin delegar el criterio

Ernesto Serrano · freelance software / DevOps
3ipunt · 2026-07-03

<!--
Presentarme en 30 segundos. Agradecer a 3ipunt la invitación. Avisar de que no habrá hype de IA: charla práctica y honesta.
-->

---

## Quién soy

- **Ernesto Serrano** — freelance software / DevOps (ernesto.es).
- Día a día: **PHP / Moodle**, **Docker**, automatización, CI/CD, infra reproducible.
- Comunidad: **esLibre**, **JASYP**, software libre desde hace años.
- No vengo a venderos una herramienta: vengo a hablar de **proceso**.

<!--
Vínculo con la audiencia: trabajo con Moodle y PHP como vosotros. Lo que cuento sale de proyectos reales, no de un blog de marketing.
-->

---

## ¿Por qué hablar de las tres cosas juntas?

- **Herramientas**, **CI** e **IA** no son temas separados.
- La IA se enchufa al final de un proceso que **ya existe**.
- Si el proceso es bueno, la IA lo hace más rápido.
- Si el proceso es malo, la IA **multiplica el desastre** más rápido todavía.

---
layout: section
---

# La idea principal

## La IA no reemplaza el proceso.
## **Amplifica lo bueno y lo malo** del proceso que ya tienes.

<!--
Esta es la frase que quiero que se lleven. Repetirla. Todo lo demás cuelga de aquí.
-->

---
layout: section
---

# El problema real

---

## El código no falla por falta de inteligencia

- Falla por **falta de feedback rápido**.
- El error existe desde el minuto 0; lo que tarda es **enterarte**.
- Cuanto más tarde llega el feedback, más caro es el arreglo.
- La pregunta no es "¿es correcto?", sino **"¿cuándo me entero de que no lo es?"**.

<!--
Ejemplo cercano: un fallo de phpcs que descubres en code review vs. en el pre-commit. Mismo bug, coste de arreglo muy distinto.
-->

---
layout: two-cols
---

## Síntomas que todos reconocemos

- **Context switching** constante: cada interrupción cuesta minutos.
- **Builds lentos** que rompen la concentración.
- **Entornos inconsistentes**: "en mi máquina funciona".

::right::

- **Revisiones superficiales** por prisa o por PRs gigantes.
- **Documentación desactualizada** que miente.
- **Pipelines que llegan tarde**: avisan cuando ya has cambiado de tarea.

---
layout: section
---

# Herramientas de desarrollo

### La base sobre la que se apoya todo lo demás

---

## El kit base (independiente del lenguaje)

- **Editor / IDE** bien configurado: navegación, refactor, LSP.
- **Terminal** y **git** con fluidez: ramas baratas, commits pequeños.
- **Docker** para entornos reproducibles.
- **Makefile** como interfaz única: `make test`, `make build`.
- **Linters** y **formatters**: discusiones de estilo automatizadas.
- **Tests** y **debugging** de verdad, no `var_dump` y rezar.
- **pre-commit hooks**: el feedback más barato posible.

<!--
El Makefile como "puerta de entrada" del proyecto: el mismo comando en local y en CI. Reduce el "¿cómo se ejecutaba esto?".
-->

---

## En contexto Moodle / PHP

```bash
# Estándar de código de Moodle
phpcs --standard=moodle local/miplugin

# Tests unitarios
vendor/bin/phpunit local/miplugin/tests

# Tests de aceptación (navegador)
vendor/bin/behat --tags=@local_miplugin

# Todo el pipeline de un plugin, en local
moodle-plugin-ci phplint && moodle-plugin-ci phpunit
```

- `moodle-plugin-ci` ejecuta **en local lo mismo** que la CI.
- Reproducir el fallo en tu máquina deja de ser una lotería.

---

## Entornos reproducibles y barandillas locales

```yaml
# .pre-commit-config.yaml (resumen)
repos:
  - repo: local
    hooks:
      - id: phpcs
        name: phpcs
        entry: phpcs --standard=moodle
        language: system
        files: \.php$
```

- El hook corre **antes** del commit: el error no llega ni a la rama.
- Mismo Docker, mismas versiones, mismo resultado para todo el equipo.

<!--
Insistir: estas barandillas locales son las que luego permiten que un agente de IA trabaje sin romper nada. Sin ellas, la IA va a ciegas.
-->

---
layout: section
---

# La CI como contrato de calidad

---

## La CI no es "un YAML al final"

- No es un trámite que pones cuando el proyecto ya está hecho.
- Es el **acuerdo del equipo** sobre qué significa "esto está aceptable".
- Es **ejecutable**: no es un wiki que nadie lee, es código que falla.
- Es **memoria**: codifica las lecciones aprendidas a base de incidentes.

---

## Qué ejecuta el mínimo aceptable

1. **Lint** y formato: estilo no negociable.
2. **Tests unitarios**: la lógica hace lo que dice.
3. **Tests de integración**: las piezas encajan.
4. **Análisis estático**: tipos, bugs probables, code smells.
5. **Build**: el artefacto se genera de verdad.
6. **Seguridad básica**: dependencias y secretos.
7. **Artefactos / releases / deploys controlados**.

<!--
No hace falta tenerlo todo el día 1. Pero sí decidir conscientemente qué entra y qué no. Cada paso es una promesa que el equipo se hace a sí mismo.
-->

---
layout: section
---

# La IA en el desarrollo

### Dónde ayuda de verdad y dónde no debe decidir sola

---
layout: two-cols
---

## Dónde la IA ayuda

- **Explorar** código desconocido: "¿dónde se valida esto?".
- **Borradores**: primer esqueleto de una función o un test.
- **Tests** para código existente sin cobertura.
- **Refactors pequeños** y mecánicos.

::right::

- **Explicar errores** y stack traces.
- **Documentación** a partir del código real.
- **Revisión inicial** (primer filtro, no el último).
- **Migraciones** repetitivas y tediosas.

---

## Dónde la IA NO debe decidir sola

- **Arquitectura**: decisiones con consecuencias a años vista.
- **Seguridad**: permisos, criptografía, control de acceso.
- **Datos sensibles**: RGPD, datos de alumnado, calificaciones.
- **Cambios masivos sin tests** que los respalden.
- **Dependencias críticas**: qué metes en producción.
- **Producción**: el último paso siempre lo aprueba una persona.

<!--
Marco clave: la IA propone, el humano dispone. En e-learning esto es serio: hablamos de datos de menores y de evaluación académica.
-->

---
layout: section
---

# IA agéntica

### Del autocompletado al agente que abre PRs

---

## Chat ≠ autocomplete ≠ agente

- **Chat**: preguntas y respuestas. Tú copias y pegas.
- **Autocomplete**: sugiere mientras escribes. Tú aceptas línea a línea.
- **Agente**: tiene **herramientas** y **bucle**: actúa, observa, corrige.

> La diferencia no es "más listo": es **cuánto le dejas tocar** sin mirar.

---

## Qué puede hacer un agente

- **Leer** todo el repositorio y entender el contexto.
- **Crear ramas** y trabajar de forma aislada.
- **Modificar** varios archivos a la vez.
- **Ejecutar** tests, linters y builds.
- **Abrir Pull Requests** con un resumen de lo que hizo.

Potente... y exactamente por eso, peligroso sin barandillas.

---

## Riesgos reales del agente

- **Cambios demasiado grandes**: un PR de 2.000 líneas que nadie revisa.
- **Falsos positivos**: "todo verde" con tests que no prueban nada.
- **Dependencias inventadas** (alucinadas) que ni existen.
- **Borrado accidental** de archivos o de configuración.
- **Secretos** expuestos en logs, commits o prompts.
- **Falta de contexto**: no conoce la decisión de negocio detrás.

<!--
Anécdota corta: el agente que "arregla" el test borrando la aserción. Verde no es lo mismo que correcto.
-->

---

## Buenas prácticas con agentes

- **Issues pequeños** y bien acotados.
- **Prompts con restricciones** explícitas (qué NO tocar).
- **Tests antes y después** del cambio.
- **Revisar los diffs** siempre, sin excepción.
- **No mezclar objetivos** en una misma tarea.
- **Commits pequeños** y reversibles.
- **CI obligatoria** antes de aceptar nada.

---
layout: section
---

# Flujo recomendado

---

## El humano abre y cierra el ciclo

```text
Humano define objetivo
   → Issue claro y pequeño
      → Agente propone un plan
         → Cambios pequeños
            → Tests locales
               → CI
                  → Pull Request
                     → Revisión humana
                        → Merge
                           → Release
```

- La IA acelera el centro; el humano controla **los extremos**.

<!--
Señalar que el principio (objetivo/issue) y el final (revisión/merge/release) son humanos. La IA vive en el tramo automatizable del medio.
-->

---
layout: section
---

# Ejemplo práctico

### Esta misma charla se construye sola

---

## El repositorio `erseco/talks`

- **Marp** para escribir slides en Markdown (esto que estáis viendo).
- **Makefile** como interfaz: `validate`, `test`, `build`.
- **GitHub Actions**: construye, valida y publica.
- **GitHub Pages**: HTML público de cada charla.
- **pre-release** con artefactos + **release** oficial al taggear.

> La presentación no se "exporta a mano": **se genera en el pipeline**.

---

## CI con permisos mínimos

```yaml
permissions:
  contents: read      # solo leer el código
  pages: write        # publicar en Pages
  id-token: write     # OIDC para el deploy

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Build slides
        run: npx @marp-team/marp-cli slides.md -o dist/index.html
```

- Principio de **mínimo privilegio**: el workflow solo puede lo necesario.

<!--
Recalcar permisos mínimos. Un workflow no necesita 'contents: write' para construir slides. Cada permiso de más es superficie de ataque.
-->

---

## Una tarea bien acotada para el agente

```text
Implement the smallest possible change to add metadata
validation for talk.yml files.
Do not modify unrelated files.
Add or update tests.
Run the validation command.
Open a PR with a concise Markdown summary.
```

- Objetivo único, límites claros, tests obligatorios y un PR revisable.
- Esto es lo contrario de "arréglame el repo".

---

## Comandos del día a día

```bash
make validate   # comprueba talk.yml y metadatos
make test       # ejecuta la batería de tests
make build      # genera HTML / PDF con Marp
```

- **Nunca toques secretos** desde un agente ni desde un prompt.
- **CI obligatoria** antes de aceptar un PR.
- **Revisa siempre el diff**: lo verde no es lo correcto.

<!--
Aquí es donde haría la demo si hay tiempo y conexión: make validate, make build, y enseñar el HTML generado. Plan B en notas.
-->

---
layout: section
---

# Cierre

---

## Lo que quiero que os llevéis

- La **calidad no empieza en la IA**: empieza en el proceso.
- La IA necesita **barandillas**: tests, CI, revisiones, límites.
- El **pipeline es la memoria del equipo**: codifica lo aprendido.
- El objetivo es **cerrar el ciclo de feedback**, no acumular herramientas.

<!--
Volver a la idea principal: la IA amplifica. Con buen proceso, amplifica calidad. Sin él, amplifica deuda técnica.
-->

---

## Takeaways

1. **Automatiza antes de escalar.**
2. **La CI debe reflejar el acuerdo de calidad del equipo.**
3. **La IA acelera, pero no valida.**
4. **Los agentes necesitan tareas pequeñas y tests.**
5. **Revisa siempre el diff.**

---
layout: center
---

## Enlaces / Gracias

- Repositorio de la charla: **https://github.com/erseco/talks**
- Web de presentaciones: **https://erseco.github.io/talks/**
- GitHub de Ernesto: **https://github.com/erseco**
- Web personal: **https://ernesto.es**

### ¡Gracias! ¿Preguntas?

<!--
Dejar la slide de enlaces abierta durante el turno de preguntas. Ofrecer enseñar el repo en vivo si alguien quiere ver el pipeline real.
-->
