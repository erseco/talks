# Notas del ponente — Herramientas de desarrollo, CI e IA

Charla para 3ipunt · 2026-07-03 · ~60 min + preguntas · Ponente: Ernesto Serrano (ernesto.es)

## Objetivo de la charla

Recorrido **práctico y tool-by-tool** por mi entorno de trabajo real, en tres bloques
—Herramientas, IA y CI— unidos por una sola idea: **automatizar el feedback**. No es una
charla de teoría ni de hype: cada herramienta que enseño la uso a diario, y siempre que
pueda la enseñaré funcionando en el terminal o en el navegador. El público debe salir con
una lista concreta de cosas que probar el lunes.

## Audiencia

Equipo técnico de 3ipunt: desarrolladores PHP/Moodle, devs de e-learning, DevOps y leads
técnicos. Ya conocen git, Docker, tests y pipelines. No hay que explicar lo básico: hay
que enseñar herramientas concretas y conectarlas con su realidad (Moodle, plugins, datos
de alumnado). Tono práctico, honesto y técnico. **Sin hype de IA.**

## Duración estimada por sección (~60 min)

**Apertura** (portada + agenda) → **2 min**

**1. Herramientas → ~18 min**
- Terminal y shell (oh-my-zsh + zsh-autosuggestions) → 4 min (con demo)
- Mis scripts (`finder`, `prs`) → 5 min (demo de `prs`)
- Gestores de paquetes (brew / apt-get / winget) → 4 min
- Utilidades (amphetamine · ncdu · codexbar) → 5 min (demo de `ncdu`)

**2. IA → ~22 min**
- Cómo uso la IA (chat ≠ autocomplete ≠ agente) → 2 min
- MCP (context7, chrome-devtools, github, exa, filesystem) → 5 min
- Skills (superpowers, security-audit, webwright…) → 4 min
- Prompts de calidad + contexto de GitHub + instrucciones → 4 min
- Ejemplo real: mod_exelearning + ADRs → 5 min (clímax de la sección)
- IA: dónde sí y dónde no → 2 min

**3. CI → ~16 min**
- Make como interfaz única → 3 min
- Entornos reproducibles (Docker / Alpine / alpine-moodle) → 4 min
- CI = lo mismo que en local (moodle-plugin-ci) → 3 min
- Lint y coding standards (biome, mago, phpcs, WP Plugin Check) → 3 min
- Dependabot y optimización (matrices, caché, previews) → 3 min

**Cierre** (automatizar + takeaways + enlaces) → **2 min**

**Total: ~60 min.** Turno de preguntas aparte. Si se va de tiempo: comprime "Utilidades"
y acorta el ejemplo de mod_exelearning a solo la diapositiva del frontmatter del ADR.

## Guion breve (hilo conductor)

- **Herramientas:** empiezo por el terminal porque es donde vivo. oh-my-zsh +
  autosuggestions, mis dos scripts (`finder`, `prs`), y la idea de que un gestor de
  paquetes "declara tu entorno" con un comando. Utilidades pequeñas que salvan el día.
- **IA:** paso del "chat" al "agente" y suelto la frase ancla: *la IA es tan buena como el
  contexto que le das*. Ese contexto tiene tres formas: **herramientas** (MCP),
  **recetas** (skills) y **contexto permanente** (instrucciones + ADRs). Remato con
  mod_exelearning: cómo hago que la IA **desarrolle y documente todo de forma trazable**.
- **CI:** el `Makefile` es el contrato — lo que corro en local es lo que corre la CI.
  Entornos reproducibles (Docker/Alpine), la CI que puedo reproducir en mi máquina,
  el lint no negociable, Dependabot y la paralelización. Todo desemboca en una palabra:
  **automatizar**. Cierro enseñando que esta misma charla se publica sola.

## Mensajes clave

- **Automatiza el feedback.** Lo que automatizas no se te olvida ni te lo saltas con prisas. (frase ancla)
- Scripts propios pequeños en tus **dotfiles** = gran retorno; en git te siguen a todas partes.
- **La IA es tan buena como el contexto que le das** (MCP + skills + instrucciones + ADRs).
- **context7** evita que la IA se invente APIs viejas: docs reales y recientes.
- Que la IA **documente de forma trazable**: ADR con `agentes` y `herramienta_ia` registrados.
- **Tu Makefile local ES tu CI**: el mismo comando en los dos sitios.
- **Alpine** siempre que se pueda: imágenes pequeñas, rápidas y con menos superficie de ataque.
- **Verde no es correcto.** Revisa siempre el diff.

## Recordatorios antes de empezar

- **Rellenar el placeholder** `<TODO: enlace a mis instrucciones personalizadas>` en las
  diapositivas "Prompts de calidad y contexto" y "Enlaces y gracias" (o quitarlo).
- Tener la terminal preparada con un directorio de demo y `prs` funcionando (`gh` con login).
- Tener abiertos en pestañas: `github.com/exelearning/mod_exelearning` (un ADR real) y
  `github.com/erseco/alpine-moodle`.

## Preguntas posibles (y respuestas cortas)

- **"¿La IA nos va a sustituir como desarrolladores?"**
  No tal como está. Sustituye tareas mecánicas, no el criterio. Quien define el problema,
  pone los límites y revisa el diff sigue siendo imprescindible.

- **"En Moodle tocamos datos de alumnado. ¿Es seguro usar IA?"**
  Nunca le des datos sensibles ni secretos a un modelo externo. Datos sintéticos o
  anonimizados, respeta RGPD, y mantén seguridad y acceso a datos como decisiones humanas.

- **"¿Para qué sirve un MCP frente a copiar y pegar en un chat?"**
  El MCP le da a la IA **herramientas y datos** para actuar: leer el repo, abrir el
  navegador, consultar docs actualizados, gestionar issues. Deja de "hablar" y "hace".

- **"El sistema de ADRs suena a mucha burocracia."**
  Lo escribe la propia IA como parte de la tarea; el coste marginal es bajo y la trazabilidad
  es enorme. No delegas el criterio, delegas la **redacción disciplinada** de la decisión.

- **"La IA inventa código que parece correcto pero no lo es."**
  Cierto. Por eso context7 para APIs reales, tests antes y después, CI obligatoria y
  revisión del diff. Si no puedes verificarlo automáticamente, no lo automatices todavía.

- **"No tenemos tiempo de montar toda esta CI."**
  No hace falta todo el día 1. Empieza por un `Makefile` con lint + tests, y llévalo tal
  cual a GitHub Actions. Cada paso que automatizas es feedback que recuperas multiplicado.

- **"¿biome/mago en un proyecto Moodle?"**
  biome para el JS del plugin; para PHP, el estándar es `phpcs --standard=moodle`. mago es
  una opción moderna para PHP en general. Usa el estándar oficial de cada ecosistema.

## Demo (pasos concretos, este repo = erseco/talks)

1. Enseñar la estructura del repo: `talk.yml`, `scripts/exe/specs/<id>.json`, `Makefile`, `.github/workflows/`.
2. `make help` → enseñar que la interfaz son verbos (`validate`, `build`, `serve`, `exe`).
3. `make build` → valida metadatos y genera el sitio estático en `output/site/`.
4. `make serve` → abrir `http://localhost:8080` y navegar hasta **esta misma** charla.
5. Enseñar un ADR real en `github.com/exelearning/mod_exelearning` (frontmatter + secciones).
6. Enseñar el workflow de GitHub Actions y el sitio publicado en `erseco.github.io/talks`.

Nota técnica: regenerar la **unidad eXeLearning** (`make exe`) es un paso local que necesita
`python3` + `pip install markdown` y la CLI de eXeLearning en `$EXE_DIR`. No lo hagas en vivo;
llévalo ya renderizado.

## Plan B sin conexión

- Llevar el **sitio ya generado** (`output/site/`) y capturas del ADR, del workflow y de una pre-release.
- Tener `prs` y `ncdu` grabados o con capturas por si falla la red o el login de `gh`.
- Clonar los repos de antemano y precachear dependencias e imágenes de Docker.
- Si todo falla: contar el flujo apoyándome en las diapositivas, que ya incluyen los snippets
  de comandos, el frontmatter del ADR y el diagrama Make → Actions → Pages.
