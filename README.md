# Mapa de recursos sociales

Aplicación web pública, simple y responsive para consultar refugios, centros diurnos, puertas abiertas y otros dispositivos sociales cercanos.

> **Estado actual:** MVP funcional orientado a consulta rápida desde celular o desde computadoras de trabajo en centros y refugios.

El MVP está pensado para dos usos principales:

1. Personas que acceden desde celular y necesitan encontrar recursos cercanos.
2. Trabajadores de refugios que usan una computadora del trabajo y necesitan orientar o derivar rapidamente a una persona hacia otro recurso cercano.

## Importante

Los datos incluidos en `src/data/resources.json` son **ficticios** y sirven solo para probar la interfaz. No deben usarse para derivaciones reales.

La app no maneja cupos, usuarios, historial de derivaciones ni datos sensibles.

Antes de incorporar informacion real, seguí la estrategia de validacion y mantenimiento en [`docs/real-data-strategy.md`](docs/real-data-strategy.md).

## Demo local

Una vez levantado el proyecto, la app queda disponible normalmente en:

```bash
http://localhost:5173
```

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- React Leaflet
- OpenStreetMap
- Supabase Auth y base de datos pública vía cliente anon

## Cómo correr el proyecto localmente

### Requisitos

- Node.js 20 LTS recomendado
- npm 10+

### Instalación

```bash
npm install
npm run dev
```

Luego abrí la URL local que muestre Vite.

## Scripts disponibles

```bash
npm run dev      # entorno local de desarrollo
npm run build    # validacion TypeScript y build de produccion
npm run preview  # vista previa del build
npm run lint     # lint del proyecto
npm test         # tests automatizados y validacion del JSON local
npm run geocode:resources -- --dry-run --limit 5  # prueba geocodificacion IDE sin escribir archivo
npm run seed:resources -- --dry-run  # valida el mapeo local hacia Supabase sin conectar
```

## Cómo editar los recursos

> **Datos reales:** no agregues recursos reales sin fuente verificable, responsable de validacion y fecha de reverificacion. Ver [`docs/real-data-strategy.md`](docs/real-data-strategy.md).

Editá el archivo:

```bash
src/data/resources.json
```

Cada recurso usa esta estructura:

```json
{
  "id": "ejemplo-refugio-001",
  "nombre": "Refugio Ejemplo Norte",
  "tipo": "Refugio nocturno",
  "direccion": "Calle Ficticia 123",
  "barrio": "Centro",
  "lat": -34.905,
  "lng": -56.185,
  "telefono": "0000 0001",
  "horario": "18:00 a 08:00",
  "poblacion": ["Hombres", "Adultos"],
  "esCentroReferencia": true,
  "observaciones": "Dato ficticio para pruebas.",
  "fuente": "Datos ficticios de prueba - no usar para derivaciones reales",
  "ultimaActualizacion": "2026-05-01",
  "verification": {
    "status": "needs_review",
    "source": "Datos ficticios de prueba; pendiente de verificación humana",
    "notes": "No usar para derivaciones reales."
  },
  "maintenance": {
    "owner": "Equipo del proyecto - datos ficticios",
    "reviewBy": "2026-06-01",
    "notes": "Reemplazar por responsable real y fecha de reverificación antes de publicar datos reales."
  }
}
```

`verification.status` puede ser `verified` o `needs_review`. Para recursos `verified`, `verification.verifiedAt` es obligatorio y debe usar formato `YYYY-MM-DD`.

`maintenance.owner` identifica a la persona, equipo o institución responsable de mantener el recurso, y `maintenance.reviewBy` define la fecha límite de revisión manual en formato `YYYY-MM-DD`. La app muestra esa trazabilidad, pero no automatiza disponibilidad, cupos ni vigencia real del dato.

El selector `Estoy usando como referencia` usa solo recursos marcados con `esCentroReferencia: true` como puntos de origen para ordenar por cercania.

Los recursos se validan en tiempo de carga con el schema de `src/data/resourceSchema.ts` y también mediante `npm test`. Si el JSON no cumple el contrato, corregí `src/data/resources.json` antes de publicar cambios.

### Geocodificar recursos pendientes

El archivo `src/data/resources-pending-geocoding.json` conserva datos extraidos del PDF con `lat` y `lng` en `null`. Para consultar coordenadas contra el servicio público de IDE Uruguay:

```bash
npm run geocode:resources -- --dry-run --limit 5
```

Cuando el resultado sea razonable, generá el archivo geocodificado:

```bash
npm run geocode:resources
```

Esto escribe `src/data/resources-geocoded.json` con estado de geocodificación por recurso. Revisá manualmente todo recurso con `geocoding.status` distinto de `matched` antes de preparar la carga final a Supabase.

### Cargar recursos locales en Supabase

El flujo de seed toma `src/data/resources.json`, lo transforma al contrato SQL de `public.resources` y hace `upsert` por `id`.

1. Primero verificá el mapeo sin conectar:

   ```bash
   npm run seed:resources -- --dry-run
   ```

2. Para cargar contra Supabase, definí secretos **solo en tu shell local**:

   ```bash
   SUPABASE_URL="https://etynewwebietxdhazhsc.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="<service-role-local>" \
   npm run seed:resources
   ```

No uses prefijos `VITE_*` para claves administrativas y no guardes `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`, frontend ni archivos versionados.

## Administración

La app expone una base segura para administración en:

- `/admin/login`: ingreso con email y contraseña de Supabase Auth.
- `/admin`: shell protegido para futuras tareas administrativas. En esta fase no incluye CRUD.

El acceso al panel requiere **dos condiciones distintas**:

1. Que exista una sesión válida de Supabase Auth.
2. Que el usuario esté habilitado en la allow-list de administración mediante la frontera de base existente (`is_admin()` / `admin_users`).

Crear o invitar administradores desde el frontend está fuera de alcance. La provisión debe hacerse externamente desde Supabase o tooling operativo seguro:

1. Crear el usuario en Supabase Auth con signup público deshabilitado.
2. Agregar su `user_id` a la tabla/lista `admin_users` según la política del proyecto.
3. Verificar que `is_admin()` devuelva `true` para esa sesión antes de entregar acceso operativo.

La configuración del navegador debe usar **solo** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Nunca agregues `service_role`, passwords de base de datos, tokens personales ni `.env.local` al repositorio.

## Funcionalidades del MVP

- Mapa con marcadores usando OpenStreetMap y Leaflet.
- Lista de recursos en tarjetas.
- Ordenamiento por distancia cuando existe un punto de origen.
- Botón `Usar mi ubicación` con geolocalización del navegador.
- Selector `Estoy usando como referencia` para usar un recurso como origen.
- Búsqueda por nombre, dirección, barrio, tipo, teléfono, horario, población u observaciones.
- Filtros por tipo de recurso.
- Filtros por poblacion atendida.
- Filtro `Abierto ahora` con lectura simple de horarios tipo `09:00 a 17:00` y horarios nocturnos como `18:00 a 08:00`.
- Botón `Como llegar` con enlace externo a OpenStreetMap.
- Botón `Copiar datos` para compartir la información práctica del recurso.
- Aviso visible sobre confirmacion de informacion por canales oficiales.
- Layout responsive: dos columnas en escritorio, una columna en celular.
- Login admin con Supabase Auth y allow-list externa para acceso al shell `/admin`.

## Decisiones técnicas del MVP

- **Frontend público con Supabase**: el navegador usa solo credenciales anon; cualquier operación privilegiada queda fuera del cliente.
- **Datos locales en JSON**: suficiente para prototipado y pruebas de UX sin exponer datos sensibles.
- **Leaflet + OpenStreetMap**: evita costos de APIs pagas y mantiene bajo el acoplamiento.
- **Origen manual por recurso**: útil cuando la geolocalización del navegador no sirve bien en computadoras de trabajo.

## Fuera de alcance por ahora

- Registro público o creación de usuarios desde frontend.
- CRUD de recursos en el panel de administración.
- Cupos en tiempo real.
- Historial de derivaciones.
- Datos personales o sensibles.
- Analíticas de seguimiento de personas usuarias.
- Datos reales de recursos.
- Claves API o servicios pagos de mapas.

## Estructura

```txt
src/
  components/
    admin/
    Header.tsx
    SearchBar.tsx
    Filters.tsx
    ResourceMap.tsx
    ResourceList.tsx
    ResourceCard.tsx
    ReferenceCenterSelector.tsx
    Notice.tsx
  data/
    resources.json
  context/
    AdminAuthContext.tsx
  hooks/
    useGeolocation.ts
    useFilteredResources.ts
  pages/
    AdminLoginPage.tsx
    AdminShell.tsx
    PublicResourcesPage.tsx
  types/
    resource.ts
  utils/
    distance.ts
    maps.ts
    clipboard.ts
    coordinates.ts
    openingHours.ts
  App.tsx
  main.tsx
  index.css
```

## Troubleshooting

### La página queda en blanco o falla el mapa

- Verificá que estés corriendo el proyecto desde la carpeta correcta del repositorio.
- Reiniciá Vite con `npm run dev` si hiciste cambios estructurales.
- Si el navegador entrega coordenadas inválidas, la app debería caer al centro por defecto en vez de romperse.

## Ideas futuras

- Reemplazar el JSON local por una API.
- Crear un panel de administracion para actualizar recursos.
- Validar datos con fuentes oficiales.
- Agregar ultima verificacion por recurso.
- Agregar filtros por dias y franjas horarias.
- Mejorar busqueda de direcciones con un geocoder publico.
- Permitir exportar o imprimir fichas de recursos.
- Agregar modo de baja conectividad o cache offline.
