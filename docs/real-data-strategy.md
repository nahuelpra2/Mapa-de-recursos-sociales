# Estrategia para datos reales

Decision actual: la carga y actualizacion de recursos es manual y local en `src/data/resources.json`. Para este MVP no hay API, backend ni importacion remota automatica.

La app puede incorporar datos reales solo si cada recurso tiene fuente verificable, fecha de verificacion, responsable de la validacion y una caducidad clara. Si un dato no cumple esa base minima, no debe publicarse como recurso real.

## Flujo manual local

### Camino rapido

1. Relevar el recurso desde una fuente oficial o institucional.
2. Confirmar por un segundo canal cuando el dato impacte una derivacion presencial.
3. Abrir un issue con la plantilla "Alta o actualización de recurso social" para dejar trazabilidad operativa.
4. Registrar `esCentroReferencia`, `fuente`, `ultimaActualizacion`, `verification` y `maintenance` en `src/data/resources.json`.
5. Usar issues o planillas solo como bitacora complementaria; el owner vigente y la proxima revision deben quedar en el JSON.
6. Ejecutar `npm run lint` y `npm test` antes de pedir review. No ejecutar build para este flujo.

### Donde editar

| Caso | Archivo | Nota |
| --- | --- | --- |
| Alta, baja o correccion de recurso local | `src/data/resources.json` | Es el dataset versionado que consume la app. |
| Schema y validacion runtime | `src/data/resourceSchema.ts` | Cambiarlo solo si cambia el modelo de datos. |
| Fixtures de tests | `src/test/fixtures/resources.ts` | No es el dataset real; no usarlo para cargar recursos. |

`src/data/resources.ts` solo importa el JSON y lo valida en el borde de datos. No agregar fetches, clientes HTTP ni supuestos de backend ahi.

### Antes de subir cambios

- [ ] Editaste el recurso en `src/data/resources.json`, no en fixtures de test.
- [ ] El `id` es estable, descriptivo y unico.
- [ ] Nombre, tipo, direccion, barrio, coordenadas, telefono y horario fueron copiados desde fuente verificable.
- [ ] `fuente` explica de donde sale el dato sin exagerar precision.
- [ ] `esCentroReferencia` indica explicitamente si el recurso debe aparecer como centro de referencia para ordenar por cercania.
- [ ] `ultimaActualizacion`, `verification.verifiedAt` cuando aplique y `maintenance.reviewBy` usan `YYYY-MM-DD`.
- [ ] `verification` expresa el estado real de verificacion humana.
- [ ] `maintenance` deja claro quien revisa y cuando vence la proxima revision.
- [ ] No agregaste datos personales, casos individuales ni informacion sensible.
- [ ] Corriste `npm run lint` y `npm test`.

## Decisiones de este MVP

| Tema | Decision |
| --- | --- |
| Alcance | El schema incluye metadata minima de verificacion humana, ownership y caducidad manual por recurso. |
| Datos actuales | `resources.json` sigue siendo ficticio y no sirve para derivaciones reales. |
| Metadatos actuales | El schema exige `esCentroReferencia`, `fuente`, `ultimaActualizacion`, `verification` y `maintenance` por recurso. |
| Ownership | `maintenance.owner` identifica la persona, equipo o institucion responsable de mantener el recurso. |
| Caducidad | `maintenance.reviewBy` define la fecha limite para reverificacion manual; no confirma vigencia real ni disponibilidad. |
| Seguridad | La app informa recursos, no confirma cupos, elegibilidad, urgencias ni disponibilidad en tiempo real. |
| Carga de datos | La fuente de verdad del MVP es `src/data/resources.json`, editado manualmente y revisado en PR. |
| API o backend | Puede evaluarse a futuro, pero no es el plan actual ni debe asumirse en cambios de datos. |

## Criterio minimo para publicar un recurso real

| Campo o evidencia | Expectativa minima |
| --- | --- |
| Fuente (`fuente`) | URL oficial, documento institucional, comunicacion formal o contacto institucional identificable. Evitar datos copiados sin trazabilidad. |
| Ultima actualizacion (`ultimaActualizacion`) | Fecha ISO `YYYY-MM-DD` del ultimo cambio validado en el JSON. |
| Centro de referencia (`esCentroReferencia`) | Booleano explicito. Usar `true` solo si el recurso debe estar disponible como origen manual de cercania. |
| Verificacion (`verification`) | Estado `verified` o `needs_review`, fuente humana de verificacion y fecha `verifiedAt` cuando el estado es `verified`. |
| Responsable (`maintenance.owner`) | Persona, equipo o institucion que verifico el dato y puede responder por la revision. |
| Caducidad (`maintenance.reviewBy`) | Fecha de proxima reverificacion manual. Sin caducidad, el recurso queda pendiente. |
| Canales criticos | Telefono, direccion, horario, modalidad de acceso y poblacion atendida deben validarse antes de publicar. |
| Observaciones | Aclarar restricciones relevantes sin incluir datos personales ni informacion sensible. |

## Cadencia de reverificacion

| Tipo de dato | Cadencia recomendada | Por que importa |
| --- | --- | --- |
| Refugios, puertas abiertas y recursos de emergencia | Cada 30 dias o antes de temporadas criticas | Cambian cupos, horarios y criterios de ingreso. |
| Centros diurnos y atencion programada | Cada 60 a 90 dias | La informacion suele cambiar menos, pero sigue impactando traslados. |
| Telefonos, horarios y direccion | Cada vez que se detecte un cambio | Un dato incorrecto puede hacer perder tiempo o exponer a una persona. |
| Datos sin responsable vigente | No publicar o retirar hasta confirmar | Sin ownership no hay mantenimiento confiable. |

## Checklist para agregar o actualizar recursos

- [ ] La fuente es oficial, institucional o verificable.
- [ ] El nombre, tipo, direccion, barrio y coordenadas coinciden con la fuente.
- [ ] El telefono y el horario fueron confirmados por un canal vigente.
- [ ] La poblacion atendida y el modo de acceso estan claros.
- [ ] `esCentroReferencia` fue decidido explicitamente; no dejarlo implicito.
- [ ] `fuente` explica de donde sale el dato.
- [ ] `ultimaActualizacion` usa formato `YYYY-MM-DD`.
- [ ] `verification.status` refleja si el recurso fue verificado o queda pendiente.
- [ ] Si `verification.status` es `verified`, `verification.verifiedAt` usa formato `YYYY-MM-DD`.
- [ ] `maintenance.owner` identifica al responsable vigente.
- [ ] `maintenance.reviewBy` define la proxima fecha de reverificacion.
- [ ] No se agregaron datos personales, casos individuales ni informacion sensible.
- [ ] Se ejecuto `npm run lint` y `npm test` para validar el JSON y los tests de integridad.

## Como completar `verification`

| Estado | Usar cuando | Campos esperados |
| --- | --- | --- |
| `verified` | Una persona confirmo el dato por una fuente verificable. | `status`, `verifiedAt`, `source` y `notes` si aporta contexto. |
| `needs_review` | El dato existe en una fuente, pero falta confirmacion humana suficiente o hay dudas. | `status`, `source` y `notes` explicando la duda cuando sea util. |

No marcar como `verified` por intuicion, por datos viejos o porque "parece oficial". Si la fuente no permite sostener el dato, usar `needs_review` o no publicar el recurso.

## Como completar `maintenance`

| Campo | Que registrar | Ejemplo |
| --- | --- | --- |
| `owner` | Persona, equipo o institucion responsable de la proxima revision. | `Equipo de datos sociales` |
| `reviewBy` | Fecha limite de reverificacion manual en formato `YYYY-MM-DD`. | `2026-06-01` |
| `notes` | Cadencia, motivo o pendiente de mantenimiento. | `Reverificar telefono antes de invierno` |

`maintenance.reviewBy` no confirma que el recurso siga activo: solo marca hasta cuando aceptamos la informacion sin nueva revision.

## Que NO hacer

- No inventar coordenadas, horarios, cupos, modalidad de acceso ni poblacion atendida.
- No marcar un dato como oficial si la fuente no es oficial o institucional.
- No convertir issues, planillas o fixtures en fuente de verdad paralela.
- No asumir datos remotos, API o backend en este MVP.
- No ejecutar `npm run build` como parte de la verificacion de carga manual.

## Plantilla operativa complementaria

Usar esta plantilla en un issue, planilla o nota de mantenimiento como bitacora del cambio. La version vigente de owner y caducidad debe quedar en `resources.json`.

| Campo | Valor |
| --- | --- |
| ID del recurso | `ejemplo-refugio-001` |
| Fuente primaria | URL, documento o contacto institucional |
| Fuente secundaria / confirmacion | Llamada, correo, sitio oficial alternativo o `No aplica` |
| Fecha de verificacion | `YYYY-MM-DD` |
| Responsable de verificacion | Persona, equipo o institucion |
| Proxima reverificacion | `YYYY-MM-DD` |
| Motivo del cambio | Alta, correccion, baja temporal, baja definitiva |
| Riesgos o dudas | Pendientes antes de publicar |

## Limites y disclaimers

- La app no reemplaza canales oficiales ni atencion profesional.
- La app no confirma cupos, disponibilidad en tiempo real, admision ni elegibilidad.
- Ante una urgencia, la persona debe usar los canales oficiales o servicios de emergencia correspondientes.
- No registrar nombres, documentos, telefonos personales, historias clinicas, situaciones individuales ni otros datos sensibles.
- Si un recurso esta vencido o en duda, se debe ocultar, retirar o marcar como pendiente antes de usarlo para orientacion real.

## Ejemplo de metadata minima

```json
{
  "verification": {
    "status": "verified",
    "verifiedAt": "2026-05-01",
    "source": "Llamada institucional",
    "notes": "Confirmado por telefono oficial"
  },
  "maintenance": {
    "owner": "Equipo responsable o institucion",
    "reviewBy": "2026-06-01",
    "notes": "Reverificacion manual mensual por criticidad del recurso"
  }
}
```

Cualquier campo adicional deberia venir con tests de schema y actualizacion completa de `resources.json`.
