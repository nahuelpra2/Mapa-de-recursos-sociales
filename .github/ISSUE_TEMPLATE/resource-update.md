---
name: Alta o actualización de recurso social
about: Registrar un alta, actualización, baja o revisión periódica de un recurso.
title: "[Recurso]: "
labels: datos, recurso
assignees: ""
---

## Acción solicitada

Marcá una opción:

- [ ] Alta de recurso nuevo
- [ ] Actualización de recurso existente
- [ ] Baja o despublicación
- [ ] Revisión periódica sin cambios

## Identificación del recurso

- **Nombre público o institucional:**
- **Tipo o categoría:** Refugio nocturno / Centro diurno / Puerta abierta / Centro de atención / Otro / No aplica

## Datos operativos a publicar o revisar

Completá solo lo que aplique. Si un dato está pendiente, escribí `pendiente`.

- **Dirección:**
- **Barrio:**
- **Teléfono o contacto institucional:**
- **Horario:**
- **Modalidad de acceso:**
- **Población atendida:**
- **Requiere derivación:** sí / no / pendiente
- **Permite acceso directo:** sí / no / pendiente
- **Observaciones públicas relevantes:**

## Fuente del dato

Evitá fuentes sin trazabilidad.

- **Fuente primaria:**
- **Fuente secundaria o confirmación adicional:**
- **Fecha de última actualización del dato:** YYYY-MM-DD

## Verificación

Debe coincidir con `verification.status` si el recurso pasa al JSON.

- **Estado:** verified / needs_review
- **Fecha de verificación (`verifiedAt`, solo si está verificado):** YYYY-MM-DD
- **Canal o fuente de verificación (`verification.source`):**
- **Notas de verificación (`verification.notes`, opcional):**

## Mantenimiento

Debe coincidir con `maintenance` si el recurso pasa al JSON. El issue queda como bitácora del cambio.

- **Responsable persona/equipo (`maintenance.owner`):**
- **Próxima fecha de revisión (`maintenance.reviewBy`):** YYYY-MM-DD
- **Notas de mantenimiento (`maintenance.notes`, opcional):**

## Chequeos críticos antes de publicar

- [ ] Confirmé que no hay nombres de personas usuarias, documentos, teléfonos personales, historias clínicas, casos individuales ni datos sensibles.
- [ ] Confirmé que este recurso no se presenta como canal de emergencia ni garantiza cupos, disponibilidad, admisión o elegibilidad en tiempo real.
- [ ] Confirmé que no hay datos ficticios o de ejemplo tratados como datos reales.
- [ ] Confirmé que la fuente es oficial, institucional o verificable.
- [ ] Confirmé que hay responsable de mantenimiento y próxima fecha de revisión en `resources.json`.

## Pendientes, riesgos o motivo de baja

Usá este espacio para dudas, bloqueos, diferencias entre fuentes o motivo de despublicación.

- 
