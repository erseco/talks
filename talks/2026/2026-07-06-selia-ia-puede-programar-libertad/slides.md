---
marp: true
theme: talks
paginate: true
title: "La IA puede programar, pero la libertad hay que cuidarla"
description: "Implicaciones de la IA en el desarrollo de software libre, con eXeLearning como ejemplo. I Jornada sobre Software Libre e IA Abierta (seLIA), 2026-07-06."
author: "Ernesto Serrano Collado"
footer: "La IA puede programar, pero la libertad hay que cuidarla · seLIA · 2026-07-06"
---

<!-- _class: lead -->

# La IA puede programar, pero la libertad hay que cuidarla

#### La IA ya escribe código. La pregunta es quién protege las libertades del que lo recibe.

<!-- nota: Saludo breve, sin hype. Tono honesto y técnico. Esto va de cuidar, no de vender. -->

---

## Quién soy

**Ernesto Serrano Collado** · [ernesto.es](https://ernesto.es)

- Rompiendo cosas desde 1983.
- Desarrollador principal del simulador de **Stevie Wonder para Android**.
- **DevOps Engineer en eXeLearning** (herramienta de autoría e-learning, libre, GPL).

<!-- nota: Presentación rápida, 30-40 s. eXeLearning es el ejemplo que recorrerá toda la charla. -->

---

## La IA puede programar (de verdad)

Hoy, sin hype, una IA me ayuda con tareas reales:

- **Generar código**: andamiaje, boilerplate, funciones repetitivas.
- **Detectar errores**: revisar diffs, sugerir casos límite.
- **Escribir pruebas**: tests unitarios y de regresión.
- **Documentar**: docstrings, READMEs, mensajes de commit.

> No es magia: es un acelerador. Útil, falible, y conviene tratarlo como tal.

<!-- nota: Reconocer lo bueno con honestidad. Si lo niego, pierdo credibilidad para la parte crítica. -->

---

<!-- _class: invert -->

## El giro

La IA cambia *cómo* desarrollamos.

En **software libre** eso no es neutro: aparecen cuestiones específicas.

### ¿Qué libertad hay que cuidar?

<!-- nota: Pausa. Aquí pivota la charla del "qué facilita" al "qué hay que proteger". -->

---

## Las cuatro libertades siguen ahí

Usar · Estudiar · Modificar · Compartir.

La IA toca **todas**: el código que entra, su procedencia, dónde se ejecuta y de qué dependemos.

A partir de aquí, cinco cuestiones concretas.

<!-- nota: Anclar en las 4 libertades del software libre da marco a las 5 cuestiones siguientes. -->

---

## 1. Licencias y procedencia del código

El código que genera la IA no cae del cielo.

- **¿Quién es el autor?** La salida de un modelo tiene un estado de copyright incierto.
- **¿Es compatible con la licencia del proyecto?** En un proyecto **GPL/copyleft** importa de dónde viene cada línea.
- Riesgo real: introducir fragmentos con procedencia desconocida o licencia incompatible.

> La licencia no es un detalle administrativo: es la garantía de las libertades.

<!-- nota: Ejemplo: un snippet "regurgitado" de un repo con licencia incompatible puede contaminar la base. -->

---

## 2. Datos de entrenamiento y *open washing*

"Open" se ha convertido en una etiqueta elástica.

- **Pesos abiertos ≠ código abierto ≠ datos abiertos.**
- Muchos modelos "open" liberan los pesos, pero **no** el dato ni el proceso de entrenamiento.
- Sin datos ni receta, no puedes **estudiar** ni **reproducir**: falla el espíritu del software libre.

> Pregunta incómoda: ¿"abierto" según quién y para hacer qué?

<!-- nota: Distinguir gradientes de apertura. "Open weights" es marketing si no hay datos ni licencia clara. -->

---

## 3. Procedencia y trazabilidad de contribuciones

Una PR asistida por IA sigue siendo una contribución: hay que poder rastrearla.

- **DCO / CLA**: quien firma se responsabiliza del origen de lo que aporta.
- ¿Cómo aceptar PRs asistidas por IA **sin contaminar** la base de código?
- Trazabilidad = poder responder mañana *de dónde salió esta línea*.

> La cadena de custodia del código importa tanto como el código.

<!-- nota: DCO (Developer Certificate of Origin) es ligero y encaja bien. El que abre la PR responde de la procedencia. -->

---

## 4. Privacidad y soberanía de datos

¿A dónde va tu código cuando pides ayuda?

- Asistente **en la nube propietaria**: tu código (y a veces el de otros) sale de tu control.
- Alternativa: **ejecutar modelos en local** con pesos abiertos.
  - `llama.cpp`, `Ollama`, modelos de pesos abiertos.
- En proyectos con datos sensibles o de terceros, esto **no es opcional**.

> Soberanía de datos: poder trabajar sin entregar el procomún a un tercero.

<!-- nota: Local no siempre iguala a la nube en calidad, pero da control. Es un equilibrio consciente. -->

---

## 5. Dependencia y *lock-in*

El riesgo silencioso: cambiar libertad por comodidad.

- Sustituir una dependencia **libre** por un **SaaS propietario imprescindible**.
- Si el proyecto deja de funcionar sin una API de pago, ya no es del todo libre.
- **Sostenibilidad del procomún**: lo que construimos debe poder vivir sin permiso de nadie.

> Una herramienta cómoda que te encierra no es un buen trato.

<!-- nota: El lock-in no llega de golpe: se cuela como dependencia "temporal" que se vuelve crítica. -->

---

<!-- _class: invert -->

## eXeLearning como ejemplo

Proyecto de software libre (GPL) que **sí** usa IA en su desarrollo.

La pregunta no es *si* usarla, sino *cómo* sin perder el carácter libre.

<!-- nota: Aquí aterrizo todo lo anterior en un caso concreto y honesto. -->

---

## Cómo interviene la IA en eXeLearning

Buenas prácticas aplicadas al proyecto (no automatismo ciego):

- **Asistencia de código** para tareas repetitivas, siempre con **revisión humana**.
- **Tests** sugeridos por IA, validados antes de entrar.
- **Documentación** asistida, revisada por personas.
- **CI** que ejecuta las pruebas: la IA propone, la *pipeline* y el equipo deciden.

<!-- nota: Hablo en términos de prácticas, sin inventar datos internos. La IA propone; el humano dispone. -->

---

## Manteniendo el carácter libre

- **Revisión humana** obligatoria de todo lo asistido por IA.
- **Licencias limpias**: vigilar procedencia antes de fusionar.
- Preferencia por herramientas **auditables y abiertas**.
- **Política de contribución** clara para PRs (incluidas las asistidas por IA).

> La IA entra en el flujo, pero no decide sola sobre la libertad del proyecto.

<!-- nota: El mensaje: la IA es una herramienta más dentro de un proceso que protege las 4 libertades. -->

---

## Cómo cuidar la libertad (checklist)

- **Revisa el diff**: línea a línea, no por fe.
- **Procedencia y licencias limpias** antes de fusionar.
- **Prefiere modelos abiertos/locales** cuando sea posible.
- **No subas datos sensibles** a servicios propietarios.
- **Mantén el control humano**: la IA propone, tú decides.
- **Devuelve al procomún** lo que la IA te ayuda a construir.

<!-- nota: Esta es la diapositiva "para llevar a casa". Si solo recuerdan una, que sea esta. -->

---

<!-- _class: lead -->

## Para llevarse a casa

- **La IA programa; tú defiendes las libertades.**
- **Pesos abiertos ≠ software libre.**
- **Cuida la procedencia y las licencias.**
- **Prefiere lo auditable y lo local.**
- **Revisa siempre el diff.**

<!-- nota: Leer despacio. Son cinco frases-ancla; que se queden con ellas. -->

---

<!-- _class: lead -->

## Enlaces · Gracias

- eXeLearning — <https://exelearning.net>
- seLIA (jornada) — <https://codeberg.org/seLIA>
- GitHub de Ernesto — <https://github.com/erseco>
- Web personal — <https://ernesto.es>

#### Gracias. ¿Preguntas?

<!-- nota: Dejar esta diapositiva fija durante el turno de preguntas. -->
