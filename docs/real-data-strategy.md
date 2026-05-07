# Estrategia para datos reales

La app puede incorporar datos reales solo si cada recurso tiene fuente verificable, fecha de verificacion, responsable de la validacion y una caducidad clara. Si un dato no cumple esa base minima, no debe publicarse como recurso real.

## Camino rapido

1. Relevar el recurso desde una fuente oficial o institucional.
2. Confirmar por un segundo canal cuando el dato impacte una derivacion presencial.
3. Abrir un issue con la plantilla "Alta o actualización de recurso social" para dejar trazabilidad operativa.
4. Registrar `fuente`, `ultimaActualizacion`, `verification` y `maintenance` en `src/data/resources.json`.
5. Usar issues o planillas solo como bitacora complementaria; el owner vigente y la proxima revision deben quedar en el JSON.
6. Ejecutar `npm run lint` y `npm test` antes de pedir review.

## Decisiones de este MVP

| Tema | Decision |
| --- | --- |
| Alcance | El schema incluye metadata minima de verificacion humana, ownership y caducidad manual por recurso. |
| Datos actuales | `resources.json` sigue siendo ficticio y no sirve para derivaciones reales. |
| Metadatos actuales | El schema exige `fuente`, `ultimaActualizacion`, `verification` y `maintenance` por recurso. |
| Ownership | `maintenance.owner` identifica la persona, equipo o institucion responsable de mantener el recurso. |
| Caducidad | `maintenance.reviewBy` define la fecha limite para reverificacion manual; no confirma vigencia real ni disponibilidad. |
| Seguridad | La app informa recursos, no confirma cupos, elegibilidad, urgencias ni disponibilidad en tiempo real. |

## Criterio minimo para publicar un recurso real

| Campo o evidencia | Expectativa minima |
| --- | --- |
| Fuente (`fuente`) | URL oficial, documento institucional, comunicacion formal o contacto institucional identificable. Evitar datos copiados sin trazabilidad. |
| Ultima actualizacion (`ultimaActualizacion`) | Fecha ISO `YYYY-MM-DD` del ultimo cambio validado en el JSON. |
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
- [ ] `requiereDerivacion` y `accesoDirecto` no se contradicen.
- [ ] `fuente` explica de donde sale el dato.
- [ ] `ultimaActualizacion` usa formato `YYYY-MM-DD`.
- [ ] `verification.status` refleja si el recurso fue verificado o queda pendiente.
- [ ] Si `verification.status` es `verified`, `verification.verifiedAt` usa formato `YYYY-MM-DD`.
- [ ] `maintenance.owner` identifica al responsable vigente.
- [ ] `maintenance.reviewBy` define la proxima fecha de reverificacion.
- [ ] No se agregaron datos personales, casos individuales ni informacion sensible.
- [ ] Se ejecuto `npm test` para validar el JSON.

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
