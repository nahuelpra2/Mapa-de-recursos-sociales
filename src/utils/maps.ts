import type { Coordinates, Resource } from "../types/resource";

export function getResourceCoordinates(resource: Resource): Coordinates {
  return { lat: resource.lat, lng: resource.lng };
}

export function createMapLink(resource: Resource, origin?: Coordinates) {
  const destination = `${resource.lat},${resource.lng}`;

  if (origin) {
    const route = `${origin.lat},${origin.lng};${destination}`;
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${encodeURIComponent(route)}`;
  }

  return `https://www.openstreetmap.org/?mlat=${resource.lat}&mlon=${resource.lng}#map=17/${resource.lat}/${resource.lng}`;
}
