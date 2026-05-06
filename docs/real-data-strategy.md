# Estrategia para datos reales

La app puede incorporar datos reales solo si cada recurso tiene fuente verificable, fecha de verificacion, responsable de la validacion y una caducidad clara. Si un dato no cumple esa base minima, no debe publicarse como recurso real.

## Camino rapido

1. Relevar el recurso desde una fuente oficial o institucional.
2. Confirmar por un segundo canal cuando el dato impacte una derivacion presencial.
3. Registrar `fuente` y `ultimaActualizacion` en `src/data/resources.json`.
4. Registrar responsable, fecha de verificacion y proxima revision en una planilla o issue de mantenimiento hasta que el schema tenga campos dedicados.
5. Ejecutar `npm run lint` y `npm test` antes de pedir review.

## Decisiones de este MVP

| Tema | Decision |
| --- | --- |
| Alcance | Documentar primero; no agregar campos al schema en este work unit. |
| Datos actuales | `resources.json` sigue siendo ficticio y no sirve para derivaciones reales. |
| Metadatos actuales | El schema ya exige `fuente` y `ultimaActualizacion` por recurso. |
| Ownership | La responsabilidad operativa vive fuera del JSON por ahora: issue, planilla o documento de mantenimiento. |
| Caducidad | Todo recurso real debe tener una proxima fecha de reverificacion definida antes de publicarse. |
| Seguridad | La app informa recursos, no confirma cupos, elegibilidad, urgencias ni disponibilidad en tiempo real. |

## Criterio minimo para publicar un recurso real

| Campo o evidencia | Expectativa minima |
| --- | --- |
| Fuente (`fuente`) | URL oficial, documento institucional, comunicacion formal o contacto institucional identificable. Evitar datos copiados sin trazabilidad. |
| Ultima actualizacion (`ultimaActualizacion`) | Fecha ISO `YYYY-MM-DD` del ultimo cambio validado en el JSON. |
| Fecha de verificacion | Fecha en que una persona confirmo que los datos siguen vigentes. Puede coincidir con `ultimaActualizacion`. |
| Responsable | Persona, equipo o institucion que verifico el dato y puede responder por la revision. |
| Caducidad | Fecha de proxima reverificacion o regla de cadencia. Sin caducidad, el recurso queda pendiente. |
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
- [ ] Hay responsable de verificacion registrado fuera del JSON.
- [ ] Hay proxima fecha de reverificacion definida.
- [ ] No se agregaron datos personales, casos individuales ni informacion sensible.
- [ ] Se ejecuto `npm test` para validar el JSON.

## Plantilla operativa temporal

Usar esta plantilla en un issue, planilla o nota de mantenimiento mientras el schema no tenga campos dedicados para ownership y caducidad.

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

## Seguimiento recomendado

Cuando el proyecto empiece a usar datos reales, evaluar una evolucion backward-compatible del schema con campos opcionales como:

```json
{
  "verificadoPor": "Equipo responsable o institucion",
  "fechaVerificacion": "2026-05-01",
  "reverificarAntesDe": "2026-06-01",
  "estadoDato": "verificado"
}
```

Ese cambio deberia venir con tests de schema y actualizacion completa de `resources.json`.
