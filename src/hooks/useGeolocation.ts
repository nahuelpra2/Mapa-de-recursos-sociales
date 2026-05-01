import { useCallback, useState } from "react";
import type { Coordinates } from "../types/resource";
import { hasValidCoordinates } from "../utils/coordinates";

type GeolocationStatus = "idle" | "loading" | "success" | "error";

export function useGeolocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Tu navegador no permite usar geolocalizacion. Podes seleccionar un centro manualmente.");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (!hasValidCoordinates(nextLocation)) {
          setStatus("error");
          setError("Recibimos una ubicacion invalida del navegador. Podes seleccionar un centro de referencia manualmente.");
          return;
        }

        setLocation(nextLocation);
        setStatus("success");
      },
      () => {
        setStatus("error");
        setError("No pudimos obtener tu ubicacion. Podes seleccionar un centro de referencia manualmente.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  return { location, status, error, requestLocation };
}
