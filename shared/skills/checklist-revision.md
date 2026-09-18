---
name: checklist-revision
description: >
  Checklist concreto para revisar código: qué mirar, ítem por ítem. Núcleo
  obligatorio (seguridad y manejo de errores) más secciones por stack
  (TypeScript/Node, React, infraestructura, Python). Úsala al revisar código;
  la política de revisión (alcance, gravedades, formato) la define el agente
  revisor-codigo.
---

# Checklist de revisión de código

## Objetivo
Dar la lista concreta de cosas que mirar al revisar código, para que no se
escape lo importante.

## Cuándo aplicarla
Al revisar código con el agente `revisor-codigo`. También sirve al revisar un PR
(`revisor-pr`).

## Cómo usarla
Es una **guía, no un formulario**. El núcleo obligatorio se revisa siempre. El
resto se recorre según lo que toque el cambio: no reportes un ítem que no
aplica.

---

## Núcleo obligatorio (siempre)

### Seguridad
- [ ] ¿Hay credenciales, tokens o llaves escritas en el código?
- [ ] ¿Entrada del usuario que llega a una consulta, comando o ruta de archivo
      sin validar? (inyección SQL, de comandos, path traversal)
- [ ] ¿Datos sensibles en logs, mensajes de error o respuestas de API?
- [ ] ¿Permisos más amplios de lo necesario?
- [ ] ¿Endpoint nuevo sin autenticación ni autorización?

### Manejo de errores
- [ ] ¿`catch` vacíos o que se tragan el error sin registrarlo?
- [ ] ¿Errores que se pierden en lugar de propagarse a quien puede actuar?
- [ ] ¿Llamadas externas (HTTP, base de datos, colas) **sin timeout**?
- [ ] ¿Recursos que no se liberan si algo falla (conexiones, archivos, locks)?
- [ ] ¿El mensaje de error le sirve a quien lo va a leer?

---

## Según el cambio

### Lógica
- [ ] ¿La condición está al revés o le falta un caso?
- [ ] ¿Índices y límites correctos (off-by-one, listas vacías)?
- [ ] ¿Se maneja el caso nulo / indefinido / cero / string vacío?
- [ ] ¿La función hace lo que su nombre dice?
- [ ] ¿Hay lógica duplicada que ya existe en otro lado?

### Pruebas
- [ ] ¿La lógica nueva tiene pruebas?
- [ ] ¿Se cubren los casos borde, no solo el camino feliz?
- [ ] ¿Alguna prueba quedó deshabilitada o vacía?
- [ ] ¿Las pruebas verifican comportamiento, no implementación?

### Datos y concurrencia
- [ ] ¿La operación es idempotente si se repite?
- [ ] ¿Hay condición de carrera si dos procesos hacen esto a la vez?
- [ ] ¿La transacción cubre todo lo que debe ser atómico?
- [ ] ¿La migración de datos es reversible?

### Rendimiento
- [ ] ¿Consulta dentro de un bucle (N+1)?
- [ ] ¿Se carga en memoria algo que puede crecer sin límite?
- [ ] ¿Falta paginación en una lista que puede ser grande?

---

## Por stack

### TypeScript / Node
- [ ] ¿`any` donde debería haber un tipo real?
- [ ] ¿Promesas sin `await` o sin manejo de rechazo?
- [ ] ¿Variables de entorno leídas sin validar que existan?
- [ ] ¿Dependencia nueva con versión abierta (`^`, `~`) en algo sensible?

### React
- [ ] ¿Dependencias faltantes o de más en `useEffect`?
- [ ] ¿Estado derivado que debería calcularse en vez de guardarse?
- [ ] ¿Listas sin `key` estable?
- [ ] ¿Elementos interactivos sin etiqueta accesible ni foco por teclado?

### Infraestructura (CDK, Terraform)
- [ ] ¿Recurso nuevo con permisos comodín (`*`)?
- [ ] ¿Cambio que destruye y recrea un recurso con datos?
- [ ] ¿Secreto en texto plano en vez de un gestor de secretos?
- [ ] ¿Falta cifrado en reposo o en tránsito?

### Python
- [ ] ¿Excepciones capturadas con `except:` desnudo?
- [ ] ¿Argumento por defecto mutable (`def f(x=[])`)?
- [ ] ¿Dependencias sin fijar versión?

---

## Resultado esperado
Una lista de hallazgos concretos, cada uno con archivo, línea y cómo
arreglarlo. Cero hallazgos es un resultado válido.

## Errores comunes al revisar
- Reportar estilo o formato: eso lo hace un linter, no una persona.
- Inventar hallazgos para parecer útil.
- Marcar todo como crítico: si todo es crítico, nada lo es.
- Revisar sin saber qué debía hacer el cambio.
