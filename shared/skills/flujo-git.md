---
name: flujo-git
description: >
  Flujo completo de git y GitHub: crear la subrama desde dev, commitear con
  convención, abrir el PR con su estándar, integrar a dev y limpiar. Incluye la
  promoción entre entornos (dev, pruebas, prod) cuando el proyecto los tenga.
  Úsala para cualquier trabajo con ramas, commits, PR o merges.
---

# Flujo de git y GitHub

## Objetivo
Llevar un cambio desde una rama nueva hasta `dev` (y hasta producción si hay
entornos) sin romper la línea base ni perder historial.

## Cuándo aplicarla
Siempre que haya que crear una rama, commitear, abrir un PR, fusionar o
promover entre entornos.

---

## Invariantes (no se negocian)

1. La rama base de trabajo es **`dev`**.
2. **Nunca se trabaja directo sobre una rama base ni de entorno.** Siempre en
   una subrama.
3. **No se compactan (squash) los commits.** El historial de la subrama se
   conserva tal cual.
4. Las ramas ya integradas **se eliminan**.
5. Los entornos **dependen de cada proyecto**: no asumas que existen.

---

## Paso 1: crear la subrama

Sale siempre de `dev` actualizado:

```bash
git checkout dev
git pull origin dev
git checkout -b feat/descripcion-corta
```

Prefijos: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`.
Descripción en minúsculas y con guiones. Ejemplo: `feat/login-con-google`.

---

## Paso 2: commitear

Conventional Commits, mensaje en **español**:

```
<tipo>: <descripcion en español>
```

Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

```bash
git add <archivos-especificos>
git commit -m "feat: agregar login con Google"
```

Reglas:
- Prefiere agregar **archivos concretos** antes que `git add .`, para no colar
  cambios ajenos.
- Un commit = un cambio con sentido propio. Varios commits pequeños está bien:
  no se van a compactar.
- El mensaje describe **qué cambia**, no qué archivos toca.

---

## Paso 3: mantener la rama al día

Si `dev` avanzó mientras trabajabas:

```bash
git fetch origin
git rebase origin/dev      # si la rama es tuya y no la ha usado nadie más
git merge origin/dev       # si ya la publicaste y otros la tienen
```

**Rebase reescribe commits**: no lo uses en una rama que otro ya descargó.

---

## Paso 4: publicar y abrir el PR

```bash
git push -u origin feat/descripcion-corta
```

Nombra la rama explícitamente. Nunca `git push` a secas ni a una rama base.

### Estándar del PR

**Título:** igual que un commit, en español, menos de 70 caracteres.
`feat: agregar login con Google`

**Descripción:** estas secciones, en este orden.

```markdown
## Qué cambia
Resumen en 2-3 líneas de qué hace este PR y por qué.

## Cómo se probó
Comandos ejecutados y resultado. Si algo no se probó, dilo.

## Impacto
Qué se rompe o cambia de comportamiento. "Ninguno" es una respuesta válida.

## Pendientes
Lo que queda fuera del alcance de este PR, si aplica.
```

Reglas del PR:
- Un PR = un propósito. Si contiene dos cosas sin relación, sepáralo.
- Si el PR quedó bloqueado a propósito, **explícalo en la descripción**: quien
  lo vea rojo debe entender por qué.

---

## Paso 5: integrar a `dev`

**Pide permiso antes de fusionar.** Un commit en tu rama es fácil de revertir;
un merge a `dev` mueve la línea base.

```bash
git checkout dev
git pull origin dev
git merge --no-ff feat/descripcion-corta
```

`--no-ff` deja visible el commit de fusión y **conserva los commits** de la
subrama. No uses squash.

---

## Paso 6: limpiar

Una vez integrada, la rama se elimina:

```bash
git branch -d feat/descripcion-corta
git push origin --delete feat/descripcion-corta
```

Usa `-d` (seguro), no `-D`: si git se niega, es porque algo no está integrado y
vale la pena revisarlo.

---

## Entornos (solo si el proyecto los tiene)

Cuando hay más de un entorno, la promoción es en un sentido:

```
subrama → dev → pruebas → prod (main)
```

Reglas:
- **Nunca commitees directo en una rama de entorno.** El cambio entra por `dev`
  y se promueve.
- Promover es fusionar la rama de entorno anterior, sin cambios nuevos por el
  camino. Si hace falta un arreglo, sale de `dev`.
- Cada proyecto define qué entornos tiene. Si solo hay `dev`, esta sección no
  aplica.

---

## Resultado esperado
El cambio en `dev` (o promovido al entorno que corresponda), con historial
completo, la rama de trabajo eliminada, y un PR que explica qué cambió y cómo
se probó.

## Errores comunes
- Compactar commits al fusionar. No se hace.
- Crear la subrama desde una rama desactualizada.
- `git add .` arrastrando cambios que no eran del trabajo.
- Rebase de una rama que ya usaba otra persona.
- Commitear directo en una rama de entorno "porque era rápido".
- Dejar ramas ya integradas sin borrar.
- Un PR que mezcla dos propósitos distintos.
