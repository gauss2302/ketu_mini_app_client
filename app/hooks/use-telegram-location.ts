"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isLocationManagerAccessGranted,
  isLocationManagerAccessRequested,
  isLocationManagerMounted,
  isLocationManagerSupported,
  mountLocationManager,
  openLocationManagerSettings,
  requestLocation,
  unmountLocationManager,
  useSignal,
} from "@telegram-apps/sdk-react";

export interface TelegramCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
}

interface TelegramLocationResponse {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number | null;
}

function getLocationErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Не удалось получить геолокацию.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("timeout")) {
    return "Telegram не успел вернуть геолокацию. Попробуйте еще раз.";
  }

  if (message.includes("cancel")) {
    return "Запрос геолокации был отменен.";
  }

  if (message.includes("notavailable")) {
    return "Геолокация недоступна на этом устройстве.";
  }

  return "Не удалось получить геолокацию из Telegram.";
}

export function useTelegramLocation() {
  const isSupported = useSignal(isLocationManagerSupported);
  const isAccessRequested = useSignal(isLocationManagerAccessRequested);
  const isAccessGranted = useSignal(isLocationManagerAccessGranted);
  const isMounted = useSignal(isLocationManagerMounted);

  const [coordinates, setCoordinates] = useState<TelegramCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      unmountLocationManager();
    };
  }, []);

  const requestCurrentLocation = useCallback(async (): Promise<TelegramCoordinates | null> => {
    if (!isSupported) {
      setError("Геолокация не поддерживается в текущем клиенте Telegram.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mountLocationManager.isAvailable() && !isMounted) {
        await mountLocationManager({ timeout: 10_000 });
      }

      const nextLocation = (await requestLocation({
        timeout: 10_000,
      })) as TelegramLocationResponse | null;

      if (!nextLocation) {
        setError("Доступ к геолокации не предоставлен.");
        return null;
      }

      const nextCoordinates: TelegramCoordinates = {
        latitude: nextLocation.latitude,
        longitude: nextLocation.longitude,
        accuracyMeters:
          typeof nextLocation.horizontal_accuracy === "number"
            ? nextLocation.horizontal_accuracy
            : null,
      };

      setCoordinates(nextCoordinates);
      return nextCoordinates;
    } catch (requestError) {
      setError(getLocationErrorMessage(requestError));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, isSupported]);

  const openSettings = useCallback(() => {
    if (openLocationManagerSettings.isAvailable()) {
      openLocationManagerSettings();
    }
  }, []);

  return {
    coordinates,
    error,
    isLoading,
    isSupported,
    isAccessRequested,
    isAccessGranted,
    canOpenSettings:
      Boolean(isSupported) &&
      Boolean(isAccessRequested) &&
      !Boolean(isAccessGranted) &&
      openLocationManagerSettings.isAvailable(),
    requestLocation: requestCurrentLocation,
    openSettings,
  };
}
