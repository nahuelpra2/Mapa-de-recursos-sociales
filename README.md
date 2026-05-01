# Mapa de recursos sociales

Aplicación web pública, simple y responsive para consultar refugios, centros diurnos, puertas abiertas y otros dispositivos sociales cercanos.

> **Estado actual:** MVP funcional orientado a consulta rápida desde celular o desde computadoras de trabajo en centros y refugios.

El MVP está pensado para dos usos principales:

1. Personas que acceden desde celular y necesitan encontrar recursos cercanos.
2. Trabajadores de refugios que usan una computadora del trabajo y necesitan orientar o derivar rapidamente a una persona hacia otro recurso cercano.

## Importante

Los datos incluidos en `src/data/resources.json` son **ficticios** y sirven solo para probar la interfaz. No deben usarse para derivaciones reales.

La app no maneja cupos, usuarios, historial de derivaciones ni datos sensibles.

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
- Datos locales en JSON

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
```

## Cómo editar los recursos

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
- Botón `Usar mi ubicación` con geolocalización del navegador.
- Selector `Estoy trabajando en` para usar un centro como origen.
- Búsqueda por nombre, dirección, barrio, tipo, teléfono, horario, población u observaciones.
- Filtros por tipo de recurso.
- Filtros por poblacion atendida.
- Filtro `Abierto ahora` con lectura simple de horarios tipo `09:00 a 17:00` y horarios nocturnos como `18:00 a 08:00`.
- Filtros por `Requiere derivacion` y `Acceso directo`.
- Botón `Como llegar` con enlace externo a OpenStreetMap.
- Botón `Copiar datos` para compartir la información práctica del recurso.
- Aviso visible sobre confirmacion de informacion por canales oficiales.
- Layout responsive: dos columnas en escritorio, una columna en celular.

## Decisiones técnicas del MVP

- **Sin backend**: se priorizó velocidad de validación del flujo y simplicidad operativa.
- **Datos locales en JSON**: suficiente para prototipado y pruebas de UX sin exponer datos sensibles.
- **Leaflet + OpenStreetMap**: evita costos de APIs pagas y mantiene bajo el acoplamiento.
- **Centro de referencia manual**: útil cuando la geolocalización del navegador no sirve bien en computadoras de trabajo.

## Fuera de alcance por ahora

- Login o cuentas de usuario.
- Backend.
- Panel de administración.
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
