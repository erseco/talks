# Notas del ponente — Herramientas de desarrollo, CI e IA

Charla para 3ipunt · 2026-07-03 · ~45 min + preguntas · Ponente: Ernesto Serrano (ernesto.es)

## Objetivo de la charla

Mostrar que las herramientas modernas de desarrollo, la integración continua (CI) y la IA forman **un solo sistema**, no tres temas sueltos. La tesis central es que **la IA no reemplaza el proceso: amplifica lo bueno y lo malo del que ya existe**. El público debe salir con un modelo mental claro para introducir IA (incluida la agéntica) sin renunciar al criterio humano ni a las barandillas de calidad.

## Audiencia

Equipo técnico de 3ipunt: desarrolladores PHP/Moodle, devs de e-learning, DevOps y leads técnicos. Gente que ya conoce git, Docker, tests y pipelines. No hay que explicar lo básico: hay que conectar su realidad (Moodle, plugins, datos de alumnado) con el uso responsable de la IA. Tono práctico, honesto y técnico. **Sin hype de IA.**

## Duración estimada por bloque (~45 min)

- Apertura (título, quién soy, idea principal) → **3 min**
- El problema real (feedback rápido, síntomas) → **4 min**
- Herramientas de desarrollo (base + Moodle/PHP + barandillas locales) → **6 min**
- La CI como contrato de calidad → **6 min**
- La IA en el desarrollo (dónde sí / dónde no) → **6 min**
- IA agéntica (chat vs agente, riesgos, buenas prácticas) → **7 min**
- Flujo recomendado → **3 min**
- Ejemplo práctico / demo (erseco/talks) → **7 min**
- Cierre + takeaways → **3 min**

**Total: ~45 min.** Dejar el turno de preguntas aparte. Si se va de tiempo, comprimir "El problema real" y acortar la demo a enseñar solo `make build` + HTML.

## Guion breve (hilo conductor)

- Engancho con una verdad incómoda: el código no falla por falta de inteligencia, sino por **falta de feedback rápido**.
- Las herramientas existen para **acortar ese feedback** (linters, tests, Docker, pre-commit). En Moodle: phpcs, phpunit, behat, moodle-plugin-ci.
- La CI eleva ese feedback a **contrato de equipo**: no es un YAML al final, es el acuerdo ejecutable de qué es "aceptable".
- Solo entonces aparece la IA: encaja **encima** de ese proceso. Si el proceso es sólido, la IA acelera; si no, amplifica el caos.
- Distingo IA agéntica de chat/autocomplete y enseño sus riesgos reales y cómo domarlos.
- Propongo un **flujo concreto**: el humano abre (objetivo/issue) y cierra (revisión/merge/release); la IA vive en el medio.
- Lo demuestro con el **propio repo de la charla** (erseco/talks): la presentación se genera en el pipeline.
- Cierro volviendo a la idea principal y a los 5 takeaways.

## Mensajes clave

- **La IA amplifica lo bueno y lo malo del proceso existente.** (frase ancla, repetir)
- El feedback tardío es el enemigo; las herramientas y la CI existen para adelantarlo.
- La CI es el acuerdo de calidad del equipo **hecho código**, y su memoria.
- La IA propone, el humano dispone: arquitectura, seguridad, datos y producción no se delegan.
- Los agentes necesitan **tareas pequeñas, restricciones explícitas y tests**.
- **Verde no es correcto.** Revisa siempre el diff.
- El objetivo es cerrar el ciclo de feedback, no acumular herramientas.

## Preguntas posibles (y respuestas cortas)

- **"¿La IA nos va a sustituir como desarrolladores?"**
  No tal como está. Sustituye tareas mecánicas, no el criterio. Quien define el problema, pone los límites y revisa el diff sigue siendo imprescindible.

- **"¿Merece la pena meter agentes si luego hay que revisarlo todo?"**
  Sí, si la tarea está bien acotada y tienes tests. El agente ahorra el tramo tedioso del medio; tú conservas los extremos (decidir y aprobar).

- **"En Moodle tocamos datos de alumnado. ¿Es seguro usar IA?"**
  Nunca le des datos sensibles ni secretos a un modelo externo. Usa datos sintéticos o anonimizados, respeta RGPD, y mantén la seguridad y el acceso a datos como decisiones humanas, no del agente.

- **"¿Y los plugins de Moodle, con sus estándares estrictos?"**
  Justo ahí brilla el proceso: phpcs, phpunit, behat y moodle-plugin-ci en CI son las barandillas que atrapan lo que la IA haga mal. La IA acelera el borrador; la CI de Moodle valida.

- **"La IA inventa código que parece correcto pero no lo es."**
  Cierto. Por eso tests antes y después, CI obligatoria y revisión del diff. Si no puedes verificarlo automáticamente, no lo automatices todavía.

- **"No tenemos tiempo de montar toda esta CI."**
  No hace falta todo el día 1. Empieza por lint + tests unitarios en pre-commit y en CI. Cada paso que añadas es feedback que recuperas multiplicado.

- **"¿No es contradictorio dar una charla 'sin hype' sobre IA?"**
  No: el mensaje es usarla como herramienta, no como oráculo. Honestidad técnica, no rechazo ni fe ciega.

## Demo opcional (pasos concretos)

1. Abrir el repo `erseco/talks` y enseñar la estructura (`talk.yml`, `slides.md`, `Makefile`, `.github/workflows`).
2. Mostrar el `talk.yml` de esta charla (metadatos).
3. Ejecutar `make validate` y comentar que valida metadatos/estructura.
4. Ejecutar `make slides` (o `make build`) para generar el HTML/PDF con Marp.
5. Abrir el HTML generado (y/o el PDF) y mostrar que es **esta misma** presentación.
6. Abrir el workflow de GitHub Actions y señalar los **permisos mínimos** (`contents: read`, `pages: write`, `id-token: write`).
7. Mostrar en Actions una **pre-release** con sus artefactos y, si hay, una **release** oficial al taggear.

## Riesgos si falla la demo

- `make build`/`make slides` falla por dependencias (Node/Marp) no instaladas en la máquina de la sala.
- Sin red: `npx @marp-team/marp-cli` intenta descargar y falla.
- Proyector con resolución rara que descuadra el HTML de Marp.
- GitHub caído o lento al enseñar Actions/releases en vivo.
- Permisos/2FA pidiendo login en mitad de la demo.

## Plan B sin conexión

- Llevar el **HTML y el PDF ya generados** en local (en el portátil y en un USB).
- Tener **capturas** del workflow de Actions, de una pre-release con artefactos y del `talk.yml`.
- Grabar (o tener a mano) un **gif/vídeo corto** de `make build` ya ejecutado.
- Clonar el repo en local de antemano y precachear dependencias (`node_modules`, imágenes Docker) para no depender de la red.
- Si todo falla: contar el flujo de palabra apoyándome en las slides 26-29, que ya muestran el snippet de Actions, el prompt del agente y los comandos `make`.
