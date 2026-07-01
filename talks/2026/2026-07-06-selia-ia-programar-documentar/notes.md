# Notas del ponente — La IA puede programar, pero la libertad hay que cuidarla

**Evento:** I Jornada sobre Software Libre e Inteligencia Artificial Abierta (seLIA)
**Fecha:** lunes 2026-07-06, franja 15:20–15:40 (charla corta, 20 min)
**Idioma:** español · **Tono:** honesto, técnico, reflexivo, sin hype de IA

---

## Objetivo

Mostrar que la IA es hoy una ayuda real para programar, pero que su uso en proyectos de **software libre** introduce cuestiones específicas que hay que cuidar de forma activa (licencias, procedencia, apertura real de los modelos, privacidad y dependencia). Usar **eXeLearning** como ejemplo concreto de proyecto libre que integra IA sin renunciar a su carácter libre, y cerrar con una checklist de buenas prácticas accionables.

Que el público salga con una idea: **la IA escribe código; la libertad la defiende el equipo humano.**

---

## Audiencia

Desarrolladores, líderes técnicos y equipos que trabajan en proyectos de software libre. Saben programar; muchos ya usan asistentes de IA. No hay que explicarles qué es la GPL, sino hacerles pensar en las implicaciones de meter IA en un proyecto copyleft. Asumir nivel técnico medio-alto; evitar el tono divulgativo y el hype.

---

## Duración por bloque (~20 min)

| Bloque | Contenido | Tiempo |
|---|---|---|
| Apertura | Título + quién soy (slides 1–2) | 2 min |
| La IA puede programar | Lo que facilita de verdad (slide 3) | 2 min |
| El giro | Pregunta central + las 4 libertades (slides 4–5) | 2 min |
| Cinco cuestiones | Licencias, open washing, procedencia, privacidad, lock-in (slides 6–10) | 6 min |
| eXeLearning | Cómo interviene la IA manteniendo lo libre (slides 11–13) | 4 min |
| Cierre | Checklist + takeaways + enlaces (slides 14–16) | 3 min |
| Reserva / preguntas | Colchón | 1 min |

Total objetivo: ~19 min de charla + paso a preguntas. Si voy justo, recortar el bloque de las cinco cuestiones (≈1 min por slide) y no la parte de eXeLearning ni la checklist.

---

## Guion breve

1. **Abrir sin hype.** "La IA ya escribe código. Eso no se discute. Lo que vengo a discutir es quién cuida las libertades del que recibe ese código."
2. **Quién soy** (rápido). Rompiendo cosas desde 1983; DevOps en eXeLearning; ese será mi ejemplo.
3. **Reconocer lo bueno.** Generación de código, detección de errores, tests, documentación. Es un acelerador útil y falible. Si niego esto, pierdo credibilidad para lo siguiente.
4. **El giro.** En software libre nada de esto es neutro. ¿Qué libertad hay que cuidar? Anclar en las 4 libertades: usar, estudiar, modificar, compartir.
5. **Cinco cuestiones** (una idea por slide, ejemplos concretos):
   - **Licencias y procedencia:** ¿quién es el autor de la salida?, ¿compatible con la GPL?, copyright incierto.
   - **Open washing:** pesos abiertos ≠ código abierto ≠ datos abiertos. Sin datos no puedes estudiar ni reproducir.
   - **Procedencia de contribuciones:** DCO/CLA, aceptar PRs asistidas sin contaminar la base, cadena de custodia.
   - **Privacidad y soberanía:** nube propietaria vs. local (llama.cpp, Ollama, pesos abiertos).
   - **Dependencia y lock-in:** no cambiar una dependencia libre por un SaaS imprescindible; sostenibilidad del procomún.
6. **eXeLearning.** Cómo entra la IA (asistencia de código, tests, documentación, CI) manteniendo lo libre: revisión humana, licencias limpias, herramientas auditables, política de contribución. Hablar de **buenas prácticas**, no inventar datos internos.
7. **Cerrar con la checklist** y los takeaways. Última frase fuerte: "La IA programa; tú defiendes las libertades."

---

## Mensajes clave

- La IA es una **herramienta real**, no magia ni amenaza: hay que tratarla como un acelerador falible.
- En software libre, el **cómo** importa tanto como el **qué**: el flujo de trabajo debe proteger las 4 libertades.
- **Pesos abiertos no es software libre.** Cuidado con el *open washing*.
- **Procedencia y licencias** son la garantía de las libertades, no papeleo.
- **Control humano + revisión del diff** son innegociables.
- Lo que la IA te ayuda a construir, **devuélvelo al procomún**.

---

## Preguntas posibles (con respuestas cortas)

**¿De quién es el copyright del código que genera la IA?**
Jurídicamente incierto y depende de la jurisdicción; en muchas, la salida puramente automática puede no tener autoría clara. Por eso lo seguro es: revisión humana, no fusionar fragmentos de procedencia dudosa y mantener trazabilidad. La cautela protege al proyecto.

**Si reviso y reescribo lo que sugiere la IA, ¿ya está limpio?**
La revisión humana sustancial ayuda mucho, pero no elimina el riesgo si el modelo "regurgitó" código con licencia incompatible. La defensa real es procedencia + revisión + no copiar verbatim fragmentos reconocibles.

**¿No es paranoia? Todo el mundo usa estos asistentes.**
Que sea común no lo hace inocuo. En software propietario el riesgo lo asume la empresa; en software libre afecta a toda la comunidad que hereda el código. El listón de cuidado es más alto, no más bajo.

**¿Qué modelo "abierto" recomiendas?**
Más que recomendar uno, propongo un criterio: cuanto más abierto (pesos + datos + licencia clara + posibilidad de ejecutarlo localmente), mejor encaja con el espíritu del software libre. Desconfía del "open" que solo libera pesos.

**Los modelos locales son peores que los de la nube.**
A veces sí en calidad bruta, pero ganas control, privacidad y soberanía de datos. Es un equilibrio consciente: para código sensible o de terceros, el control pesa más que el último punto de rendimiento.

**¿Esto frena la productividad del proyecto?**
No: revisar el diff y cuidar licencias es parte de hacer ingeniería seria, con o sin IA. La IA acelera; el proceso de revisión es el mismo que ya deberíamos tener.

**¿Cómo gestionáis las PRs asistidas por IA en eXeLearning?**
En términos de buenas prácticas: revisión humana, atención a la procedencia y a las licencias, preferencia por herramientas auditables y una política de contribución clara. La IA propone, el equipo y la CI deciden.

---

## Riesgos / plan B

- **Charla corta, sin demo:** no dependo de ejecutar nada en vivo, así que el riesgo técnico es bajo. Ventaja: si algo falla, sigo hablando.
- **Si falla el proyector:** la charla funciona como discurso. Llevar las **5 cuestiones** y los **5 takeaways** memorizados; se pueden contar sin slides. Estructura: lo bueno de la IA → el giro → 5 cuestiones → eXeLearning → checklist.
- **Si voy corto de tiempo:** comprimir las 5 cuestiones a un titular cada una (≈30 s) y conservar eXeLearning + checklist + takeaways.
- **Si voy largo:** saltar la slide de las 4 libertades (slide 5) y fusionar las cuestiones 4 y 5 en la exposición.
- **Si me preguntan por detalles internos de eXeLearning que no puedo confirmar:** responder en clave de buenas prácticas y ofrecer seguir la conversación después; no inventar datos.
- **Enlaces de respaldo** (por si alguien los pide): exelearning.net · codeberg.org/seLIA · github.com/erseco · ernesto.es
