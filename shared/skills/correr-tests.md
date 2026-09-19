---
name: correr-tests
description: >
  Procedimiento para descubrir cómo se prueba un proyecto, correr las pruebas
  (todas o solo las afectadas) y montar un framework si no existe. Incluye los
  comandos concretos por ecosistema. Úsala cuando haya que ejecutar pruebas o
  averiguar qué pruebas tiene el repo.
---

# Correr y montar tests

## Objetivo
Ejecutar las pruebas correctas de un proyecto sin inventar el comando, y saber
qué hacer si el proyecto no tiene pruebas.

## Cuándo aplicarla
Cuando haya que correr pruebas, averiguar qué pruebas existen, o montar el
andamiaje de pruebas en un repo que no lo tiene.

---

## Paso 1: descubre cómo se prueba (nunca lo inventes)

Lee la configuración del proyecto antes de ejecutar nada:

| Ecosistema | Dónde mirar | Qué buscar |
|---|---|---|
| Node / TypeScript | `package.json` | `scripts.test`, `scripts.build` |
| Python | `pyproject.toml`, `tox.ini`, `pytest.ini` | sección de pytest o tox |
| Java | `pom.xml`, `build.gradle` | plugin surefire, tarea `test` |
| Go | archivos `*_test.go` | no hay config: `go test` |
| Rust | `Cargo.toml` | `cargo test` |
| .NET | `*.csproj`, `*.sln` | `dotnet test` |
| Genérico | `Makefile`, `justfile`, `README` | target `test` |

Si hay varias suites (unit, integración, e2e), identifícalas por separado: no
son lo mismo y no cuestan lo mismo.

**Si no encuentras cómo probar, dilo. No improvises un comando.**

---

## Paso 2: elige el alcance

Prefiere **lo afectado por el cambio** antes que la suite completa.

| Runner | Un archivo | Una prueba por nombre |
|---|---|---|
| Vitest | `npx vitest run ruta/archivo.test.ts` | `npx vitest run -t "nombre"` |
| Jest | `npx jest ruta/archivo.test.ts` | `npx jest -t "nombre"` |
| pytest | `pytest tests/test_x.py` | `pytest tests/test_x.py::test_nombre` |
| Maven | `mvn test -Dtest=MiClase` | `mvn test -Dtest=MiClase#metodo` |
| Go | `go test ./paquete/...` | `go test ./paquete -run TestNombre` |
| Cargo | `cargo test --test mi_test` | `cargo test nombre_test` |
| .NET | `dotnet test --filter MiClase` | `dotnet test --filter Nombre` |

Usa los scripts del proyecto (`npm test -- <args>`) en vez del binario suelto
cuando existan: pueden traer configuración necesaria.

---

## Paso 3: corre y lee el resultado

1. Ejecuta el comando.
2. Si el proyecto compila, corre también el **build**: un build roto invalida
   cualquier resultado de pruebas.
3. Lee el conteo real (`X pasaron, Y fallaron`) y el **código de salida**.
4. Del primer fallo, guarda la salida cruda: es la evidencia útil.

Distingue tres cosas que se confunden:
- **Prueba que falla** — el código no hace lo esperado.
- **Build o compilación roto** — nada se pudo probar.
- **Suite que no corrió** — falta una dependencia, un servicio o una variable
  de entorno.

---

## Paso 4: si el proyecto no tiene pruebas

Monta el framework estándar del ecosistema, sin inventar uno exótico:

| Ecosistema | Estándar por defecto |
|---|---|
| Node / TypeScript | Vitest (o Jest si el repo ya lo usa) |
| React | Vitest + Testing Library |
| Python | pytest |
| Java | JUnit 5 |
| Go | `testing` de la librería estándar |
| Rust | `cargo test` |
| .NET | xUnit |

Reglas al montarlo:
- Si el repo ya tiene un runner, **úsalo**; no metas un segundo.
- Añade un script `test` al archivo de configuración, para que el siguiente no
  tenga que adivinar.
- Empieza con una prueba real que falle si el código se rompe, no un
  placeholder vacío.

---

## Resultado esperado
El comando exacto que se ejecutó, el conteo real de pruebas, el estado del
build, y una lista explícita de lo que **no** se verificó.

## Errores comunes
- Inventar el comando en vez de leerlo de la configuración.
- Decir "todo pasó" cuando solo corriste un subconjunto.
- Confundir un build roto con pruebas que fallan.
- Correr la suite completa cuando bastaba el archivo tocado.
- Montar un runner nuevo cuando el proyecto ya tenía otro.
- Contar como verde una suite que terminó sin ejecutar nada.
