---
name: grill-me
description: >
  Interroga al usuario una pregunta a la vez para afilar un plan o diseño antes
  de construir. Úsala cuando el plan está vago, antes de codear algo no trivial,
  o cuando el usuario pide estresar un plan ("gríllame").
---

# grill-me (entrevista para afilar un plan)

> Inspirada en grill-me de mattpocock/skills. Reescrita como procedimiento
> autocontenido en español (el original es solo un stub que depende del runtime
> de Claude). Actívala diciendo "gríllame" o `/grill-me`.

## Objetivo
Interrogar al usuario sin piedad, UNA pregunta a la vez, para sacar todo lo que
tiene en la cabeza sobre un plan o diseño y dejarlo escrito antes de construir.

## Cuándo aplicarla
Antes de empezar a codear algo no trivial, cuando el plan aún está vago, o
cuando el usuario dice "gríllame" / "estresa este plan".

## Cómo funciona

### Regla de oro: una pregunta a la vez
Haz UNA sola pregunta por turno. Espera la respuesta. Luego la siguiente. Nunca
dispares una lista de preguntas de golpe.

### Ataca por capas (de general a específico)
1. **Objetivo:** ¿qué problema resuelve esto? ¿para quién? ¿cómo se ve "listo"?
2. **Alcance:** ¿qué NO entra? ¿qué es lo mínimo que sirve?
3. **Supuestos:** ¿qué estás dando por hecho? Cuestiona cada uno.
4. **Bordes:** ¿qué pasa si falla? ¿casos raros? ¿datos malos?
5. **Decisiones:** en cada bifurcación, obliga a elegir y anota por qué.

### Busca huecos, no confirmes
Tu trabajo es encontrar lo que falta o se contradice, no aprobar. Si algo suena
vago ("que sea rápido", "algo escalable"), pide número o ejemplo concreto.

### Detecta incoherencias
Si dos respuestas chocan, dilo en el momento y pide que resuelva cuál manda.

### No avances sin claridad
Si el usuario no sabe algo, no lo rellenes tú: márcalo como decisión pendiente.

## Resultado esperado
Al terminar, entrega un resumen escrito: objetivo, alcance, supuestos validados,
decisiones tomadas (con su porqué) y lista de pendientes sin resolver. Ese
resumen es la base del plan.

## Cuándo parar
Cuando ya no encuentres huecos nuevos, o el usuario diga "suficiente". Entrega
el resumen y ofrece pasar al plan.
