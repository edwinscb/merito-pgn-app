---
name: verificacion-web
description: >
  Verificar visualmente una página o un cambio de frontend con playwright-cli:
  abrir la URL, tomar snapshot, interactuar, capturar pantalla y leer el
  resultado desde disco. Úsala cuando haya que comprobar cómo se ve o se
  comporta algo en el navegador, no solo si el código compila.
---

# Verificación web con playwright-cli

## Objetivo
Comprobar en un navegador real que un cambio de frontend hace lo que dice, en
vez de asumirlo porque el build pasó.

## Cuándo aplicarla
- Después de cambiar algo visual o interactivo.
- Para verificar un flujo (login, formulario, navegación).
- Cuando el contenido de una página se genera con JavaScript y no basta con
  descargar el HTML.

Si solo necesitas **leer** una página estática, no uses el navegador: es más
barato descargar el contenido.

---

## Requisito
```bash
npm install -g @playwright/cli@latest
```
Necesita **Node.js 20 o superior**. Es una herramienta global, no una
dependencia del proyecto. `setup.ps1` avisa si no está instalada.

---

## La idea clave: el disco, no el contexto

`playwright-cli` **guarda el estado a disco** y te imprime la ruta. Tú decides
qué leer. Por eso consume mucho menos contexto que un servidor MCP de navegador,
que inyecta el árbol completo en cada paso.

Regla práctica: **lee el archivo de snapshot solo cuando necesites el árbol.**
La URL y el título que imprime el comando suelen bastar.

---

## Flujo básico

```bash
playwright-cli open http://localhost:3000    # abrir
playwright-cli snapshot                      # obtener refs de elementos
playwright-cli click <ref>                   # interactuar
playwright-cli fill <ref> "texto"
playwright-cli screenshot                    # capturar
playwright-cli console                       # ver errores de consola
```

Cada comando imprime la URL, el título y **la ruta del archivo** que generó.

### Las refs mueren con la página
Un `ref` pertenece al snapshot que lo produjo. Después de navegar, recargar o de
un clic que cambia la página, **toma un snapshot nuevo**. Una ref vieja puede
golpear el elemento equivocado sin dar error.

### Capturas de pantalla
Toma la captura sin pasar nombre de archivo y **usa la ruta que imprime**. Pasar
un nombre propio resuelve contra el directorio actual y puede sobrescribir algo
del repositorio. El argumento posicional es una **ref de elemento**, no una ruta.

Para mostrarla en el chat: `![qué muestra](/ruta/absoluta.png)`.

---

## Sesiones paralelas
Si varios procesos pueden usar el navegador a la vez, dale a cada uno un nombre
propio y úsalo en **todos** sus comandos:

```bash
playwright-cli -s=mi-tarea open http://localhost:3000
playwright-cli -s=mi-tarea snapshot
```

Sin esto, un `open` tuyo mueve la página de otro y un `close` tuyo destruye su
navegador. Reutiliza **un** nombre: uno nuevo por comando deja navegadores
huérfanos.

---

## Navegador propio vs. navegador del usuario

- **Propio** (por defecto): un Chromium limpio, sin sesiones. Para todo lo
  normal.
- **Adjunto** (`attach`): el navegador real del usuario, con sus logins y sus
  pestañas abiertas. Requiere una extensión que solo él puede instalar.

Si trabajas con el adjunto, trátalo como **prestado**: no saques una pestaña de
lo que estaba haciendo, y **nunca lo cierres** (`close` se lleva sus ventanas).
Para terminar, usa `detach`.

---

## Comandos que requieren cuidado

Estos no son de uso rutinario. Pídelos solo si hacen falta, y avisa antes:

- **Imprimen credenciales:** los que listan cookies, `localStorage`,
  `sessionStorage` o peticiones de red. Una cookie de sesión *es* el login, y
  una URL prefirmada lleva su propia credencial (ver skill `manejo-secretos`).
- **Destruyen estado:** cerrar, borrar datos, limpiar cookies. Contra un
  navegador adjunto, eso es el estado real del usuario.
- **Ejecutan código arbitrario** en una página autenticada, o suben un archivo
  local a la página.

---

## Resultado esperado
Evidencia concreta de que el cambio funciona: la captura, el estado de la
consola, y qué se comprobó exactamente. Si algo no se pudo verificar, dilo.

## Errores comunes
- Decir que un cambio visual funciona sin haberlo mirado.
- Reusar una ref después de que la página cambió.
- Leer el archivo de snapshot entero cuando bastaba la URL impresa.
- Pasar un nombre de archivo a la captura y sobrescribir algo del repo.
- Usar un nombre de sesión distinto en cada comando.
- Cerrar el navegador adjunto del usuario.
