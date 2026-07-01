# Notas del ponente — Inteligencia artificial: programar, documentar y no acabar en un berenjenal

**Evento:** I Jornada sobre Software Libre e Inteligencia Artificial Abierta (seLIA)
**Fecha:** lunes 2026-07-06 · charla corta (~15–20 min) + stand
**Idioma:** español · **Tono:** ameno, honesto, sin hype de IA

Navegación en árbol: **Inicio → 3 nodos (La IA hoy / ADRs / Agnóstica y libre) con subnodos → Cierre.**

---

## Objetivo

La IA ya programa y documenta; lo difícil es **no acabar en un berenjenal**: ir rápido sin
perder el **porqué** de cada decisión. La tesis: **documenta las decisiones (ADRs), no solo el
código**, y hazlo **trazable, agnóstico de motor y sobre software libre**. Caso real:
**mod_exelearning**. Es la "parte de IA" de la charla de 3ipunt, enfocada a software libre.

Que el público salga con una idea accionable: **la IA propone y redacta; tú decides, y lo dejas
por escrito de forma que cualquier IA (o persona) pueda retomarlo.**

---

## Audiencia

Comunidad de software libre: desarrolladores, responsables técnicos y equipos. Ya usan (o
evalúan) asistentes de IA. No hay que venderles la IA ni explicarles la GPL; hay que darles un
**método** para usarla con criterio y sin lock-in. Nivel medio-alto; evitar el hype.

---

## Tiempos (~20 min)

- Inicio (título, bio, idea central) → **2 min**
- La IA hoy… y el berenjenal → **4 min**
- ADRs: la IA apoya la decisión (núcleo) → **7 min**
- Agnóstica, transparente y libre → **5 min**
- Cierre (takeaways + moraleja) → **2 min**

Si voy justo: comprimo "La IA hoy" y voy directo a los ADRs. El bloque que **no** se recorta es
"ADRs" + "agnóstica/libre": son el corazón para esta jornada.

---

## Guion (hilo conductor)

- **Gancho:** la IA te lleva a producción a toda velocidad; el problema es acordarte de **por
  qué** tomaste cada curva. El código queda; el porqué se evapora → berenjenal.
- **Salida:** capturar la **decisión**, no solo el resultado → **ADR** (`DEC-NNNN`): Contexto,
  Problema, **Opciones + Evidencia + Decisión**, Consecuencias…
- **Reparto de papeles:** la IA redacta opciones y evidencia; el humano fija el `estado`
  (Propuesta→Aceptada/Rechazada). "Sin fuente no hay afirmación." Auditorías multi-agente → el
  humano tría (DEC-0016: 21 hallazgos, 18 fix / 3 difiere).
- **Agnóstico:** el frontmatter registra `interfaz`+`modelo`. DEC-0043 lo hizo **codex+gpt-5**;
  DEC-0044, **claude-code+claude-fable-5**. La decisión sobrevive al motor → **cero lock-in**.
- **Libre:** el repo público (GPLv3) **es el contexto**: cualquier IA lo lee y retoma el hilo;
  transparencia y auditoría. Pesos abiertos ≠ software libre; prefiere abierto/local.
- **Cierre:** 5 takeaways + moraleja de humor del berenjenal.

---

## Mensajes clave

- **La IA no te saca del berenjenal; un buen ADR, sí.** (frase de cierre)
- Documenta la **decisión** (el porqué), no solo el código.
- **La IA propone, el humano dispone.** El `estado` del ADR es del humano.
- **Agnóstico de motor:** registra qué IA/modelo; cambia de proveedor sin perder el hilo.
- **Sin fuente no hay afirmación** (repo+ruta+commit, docs oficiales o experimento).
- El **repo libre** da contexto y transparencia; un repo cerrado no puede.

---

## Datos reales para citar (mod_exelearning, GPLv3 · github.com/exelearning/mod_exelearning)

- **60 ADRs** — 53 aceptadas, 4 propuestas, 3 superseded.
- Ejemplos de agnosticismo: **DEC-0043** (codex + gpt-5), **DEC-0044** (claude-code + claude-fable-5).
- Auditorías multi-agente: **DEC-0016** (21 hallazgos → 18 fix / 3 difiere), **DEC-0044**
  (9 confirmados / 2 rechazados; el humano prioriza el crítico antes de la beta).
- Regla: **"Evidencia antes que preferencia — sin fuente no hay afirmación."** (research/AGENTS.md)

---

## Preguntas posibles (y respuestas cortas)

- **"¿Esto no es mucha burocracia para ir rápido?"**
  El ADR lo redacta la propia IA como parte de la tarea; el coste marginal es bajo y te ahorra
  el berenjenal de dentro de tres semanas. Documentas la decisión, no cada línea.

- **"¿Y si mañana cambio de IA/proveedor?"**
  Justo por eso funciona: el frontmatter registra interfaz+modelo y la evidencia se cita. La
  decisión es del repo, no de la herramienta. Cambias de motor sin perder nada.

- **"¿Sirve con modelos locales / pesos abiertos?"**
  Sí, el proceso es idéntico (Ollama, llama.cpp…). De hecho encaja mejor con la filosofía libre:
  auditable y sin enviar tu código a terceros.

- **"¿La IA decide por ti?"**
  No. Redacta opciones y evidencia; el `estado` (Aceptada/Rechazada) lo pones tú. Revisa el diff.

- **"¿Y si el repo es privado?"**
  Pierde casi toda la gracia: sin repo libre y público no hay contexto compartido ni auditoría
  externa. La transparencia es la que sostiene la confianza.

---

## Demo (si hay pantalla)

1. Abrir `github.com/exelearning/mod_exelearning` → `research/decisiones/adr/`.
2. Enseñar un ADR real (p. ej. DEC-0043): frontmatter (`estado`, `agentes`, `herramienta_ia`) +
   secciones (Opciones/Evidencia/Decisión).
3. Enseñar `research/AGENTS.md` y la regla "sin fuente no hay afirmación".
4. Si no hay red: llevar capturas del ADR y del AGENTS.md.
