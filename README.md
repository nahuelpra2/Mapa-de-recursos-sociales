# Mapa de recursos sociales

Aplicacion web publica, simple y responsive para consultar refugios, centros diurnos, puertas abiertas y otros dispositivos sociales cercanos.

El MVP esta pensado para dos usos principales:

1. Personas que acceden desde celular y necesitan encontrar recursos cercanos.
2. Trabajadores de refugios que usan una computadora del trabajo y necesitan orientar o derivar rapidamente a una persona hacia otro recurso cercano.

## Importante

Los datos incluidos en `src/data/resources.json` son ficticios y sirven solo para probar la interfaz. No deben usarse para derivaciones reales.

La app no maneja cupos, usuarios, historial de derivaciones ni datos sensibles.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- React Leaflet
- OpenStreetMap
- Datos locales en JSON

## Como correr el proyecto localmente

```bash
npm install
npm run dev
```

Luego abrir la URL local que muestre Vite, normalmente:

```bash
http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev      # entorno local de desarrollo
npm run build    # validacion TypeScript y build de produccion
npm run preview  # vista previa del build
```

## Como editar los recursos

Editar el archivo:

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
  "requiereDerivacion": true,
  "accesoDirecto": false,
  "observaciones": "Dato ficticio para pruebas.",
  "fuente": "Datos ficticios de prueba - no usar para derivaciones reales",
  "ultimaActualizacion": "2026-05-01",
  "esCentroReferencia": true
}
```

Para que un recurso aparezca en el selector `Estoy trabajando en`, usar:

```json
"esCentroReferencia": true
```

## Funcionalidades del MVP

- Mapa con marcadores usando OpenStreetMap y Leaflet.
- Lista de recursos en tarjetas.
- Ordenamiento por distancia cuando existe un punto de origen.
- Boton `Usar mi ubicacion` con geolocalizacion del navegador.
- Selector `Estoy trabajando en` para usar un centro como origen.
- Busqueda por nombre, direccion, barrio, tipo, telefono, horario, poblacion u observaciones.
- Filtros por tipo de recurso.
- Filtros por poblacion atendida.
- Filtro `Abierto ahora` con lectura simple de horarios tipo `09:00 a 17:00` y horarios nocturnos como `18:00 a 08:00`.
- Filtros por `Requiere derivacion` y `Acceso directo`.
- Boton `Como llegar` con enlace externo a OpenStreetMap.
- Boton `Copiar datos` para compartir la informacion practica del recurso.
- Aviso visible sobre confirmacion de informacion por canales oficiales.
- Layout responsive: dos columnas en escritorio, una columna en celular.

## Fuera de alcance por ahora

- Login o cuentas de usuario.
- Backend.
- Panel de administracion.
- Cupos en tiempo real.
- Historial de derivaciones.
- Datos personales o sensibles.
- Analiticas de seguimiento de personas usuarias.
- Datos reales de recursos.
- Claves API o servicios pagos de mapas.

## Estructura

```txt
src/
  components/
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
  hooks/
    useGeolocation.ts
    useFilteredResources.ts
  types/
    resource.ts
  utils/
    distance.ts
    maps.ts
    clipboard.ts
    openingHours.ts
  App.tsx
  main.tsx
  index.css
```

## Ideas futuras

- Reemplazar el JSON local por una API.
- Crear un panel de administracion para actualizar recursos.
- Validar datos con fuentes oficiales.
- Agregar ultima verificacion por recurso.
- Agregar filtros por dias y franjas horarias.
- Mejorar busqueda de direcciones con un geocoder publico.
- Permitir exportar o imprimir fichas de recursos.
- Agregar modo de baja conectividad o cache offline.
