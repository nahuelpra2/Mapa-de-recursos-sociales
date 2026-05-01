import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { SearchOrigin, ResourceWithDistance } from "../types/resource";
import { createMapLink } from "../utils/maps";
import { hasValidCoordinates } from "../utils/coordinates";

const defaultCenter: [number, number] = [-34.9011, -56.1645];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

type ResourceMapProps = {
  resources: ResourceWithDistance[];
  origin: SearchOrigin | null;
};

export function ResourceMap({ resources, origin }: ResourceMapProps) {
  const safeOrigin = hasValidCoordinates(origin) ? origin : null;
  const validResources = resources.filter((resource) => hasValidCoordinates(resource));
  const center: [number, number] = safeOrigin ? [safeOrigin.lat, safeOrigin.lng] : defaultCenter;
  const mapKey = `${center[0]}:${center[1]}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-label="Mapa de recursos">
      <MapContainer key={mapKey} center={center} zoom={13} scrollWheelZoom className="h-[24rem] w-full md:h-[calc(100vh-9rem)] md:min-h-[42rem]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {safeOrigin ? (
          <CircleMarker center={[safeOrigin.lat, safeOrigin.lng]} radius={10} pathOptions={{ weight: 3 }}>
            <Popup>
              <strong>Origen seleccionado</strong>
              <br />
              {safeOrigin.mode === "current-location" ? "Tu ubicacion actual" : safeOrigin.label}
            </Popup>
          </CircleMarker>
        ) : null}

        {validResources.map((resource) => (
          <Marker key={resource.id} position={[resource.lat, resource.lng]}>
            <Popup>
              <div className="space-y-1 text-sm">
                <strong>{resource.nombre}</strong>
                <p>{resource.tipo}</p>
                <p>{resource.direccion}</p>
                <p>{resource.horario || "Horario no informado"}</p>
                <p>{resource.telefono || "Telefono no informado"}</p>
                <a href={createMapLink(resource, safeOrigin || undefined)} target="_blank" rel="noreferrer">
                  Como llegar
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
