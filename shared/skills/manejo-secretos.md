---
name: manejo-secretos
description: >
  Procedimiento para detectar secretos expuestos en el código, actuar cuando ya
  se filtró uno (rotar primero) y manejar credenciales correctamente por
  entorno. Úsala al revisar código, antes de commitear, o cuando aparezca una
  credencial donde no debía.
---

# Manejo de secretos y variables de entorno

## Objetivo
Evitar que una credencial termine en el repositorio, y saber qué hacer cuando
ya terminó ahí.

## Cuándo aplicarla
Al revisar código, antes de commitear cambios que tocan configuración, o cuando
encuentres algo que parece una credencial.

---

## Parte 1: qué cuenta como secreto

**Sí es secreto:**
- Contraseñas, tokens, API keys, llaves privadas.
- Cadenas de conexión con usuario y contraseña.
- **URLs prefirmadas** (S3, blob storage): la firma *es* la credencial, aunque
  expire.
- Webhooks con token en la ruta.
- Certificados privados, claves SSH, archivos `.pem` / `.p12`.
- Cookies de sesión y tokens de refresco.

**No es secreto (no lo trates como tal):**
- Nombres de recursos, regiones, IDs públicos.
- Rutas de parámetros (`/app/dev/mi-parametro`) — el *nombre* no, el *valor* sí.
- Versiones, banderas de configuración no sensibles.

Si dudas: ¿alguien con esto puede entrar o gastar dinero? Entonces es secreto.

---

## Parte 2: dónde buscar

Los secretos casi nunca están en el código obvio. Revisa:

- `.env`, `.env.local` y compañía — ¿están en `.gitignore`? ¿alguno commiteado?
- **Fixtures y datos de prueba** — credenciales "de mentira" que son reales.
- **Artefactos exportados** — colecciones de Postman/Insomnia, snapshots, dumps.
- **Logs y mensajes de error** — tokens impresos al depurar.
- **Notebooks** (`.ipynb`) — las salidas guardadas conservan lo impreso.
- **Infraestructura como código** — valores en texto plano en vez de referencia
  al gestor de secretos.
- **Documentación y README** — ejemplos con credenciales reales.
- **Historial de commits** — un secreto borrado hoy sigue en la historia.

Qué buscar en texto: `password`, `secret`, `token`, `api_key`, `apikey`,
`Bearer `, `-----BEGIN`, `AKIA`, `X-Signature`, `?sig=`, `AccountKey=`.

---

## Parte 3: encontraste un secreto expuesto

El orden importa. No lo cambies.

1. **No lo copies a ningún lado.** No lo pegues en el chat, en el PR, en un
   ticket ni en el mensaje del commit. Refiérete a él por nombre y ubicación:
   "hay una API key en `src/config.ts:14`".
2. **Rotar es lo primero, no lo último.** Si estuvo en el repositorio, se
   considera comprometido: da igual que lo borres, pudo ser clonado. Avisa que
   hay que revocar y regenerar esa credencial **ya**.
3. **Quítalo del código** y reemplázalo por lectura de variable de entorno o
   del gestor de secretos.
4. **Añádelo a `.gitignore`** si es un archivo que nunca debió versionarse.
5. **Sobre limpiar el historial de git:** es una operación **destructiva**
   (reescribe commits y exige force push). **Requiere aprobación explícita del
   usuario.** Y aunque se haga, el paso 2 sigue siendo obligatorio: limpiar la
   historia no "descompromete" la credencial.

---

## Parte 4: cómo se manejan bien

### En el código
- Lee de variables de entorno, nunca de literales.
- **Valida al arrancar** que las variables requeridas existen, y falla con un
  mensaje claro. Un `undefined` que revienta en producción es peor.
- No imprimas el valor en logs, ni al depurar. Registra el *nombre*.

### Por entorno
- Un valor distinto por entorno (dev, pruebas, prod), nunca compartido.
- Usa el gestor del proveedor (AWS Secrets Manager, SSM Parameter Store con
  cifrado) en vez de archivos de configuración.
- Referencia el secreto desde la infraestructura; no lo copies al código.

### En CI/CD (GitHub Actions)
Distingue las dos cosas, porque se confunden:
- **Secrets** — valores sensibles. Enmascarados en los logs.
- **Variables** — valores administrativos no sensibles (una versión, un
  nombre de entorno). Visibles, y está bien.

No des credenciales al CI de un pull request de terceros: ese contexto no es
confiable.

---

## Resultado esperado
Ningún secreto en el código ni en artefactos versionados. Los que se filtraron,
**rotados** y reemplazados por referencia a variable de entorno o gestor de
secretos.

## Errores comunes
- Borrar el secreto del código y no rotarlo. Sigue comprometido.
- Pegar el secreto en el PR o en el chat al reportarlo.
- Creer que una URL prefirmada no es una credencial.
- Tratar el *nombre* de un parámetro como secreto y ofuscar de más.
- Commitear un `.env` "solo de desarrollo" con credenciales reales.
- Reescribir el historial de git sin pedir permiso.
