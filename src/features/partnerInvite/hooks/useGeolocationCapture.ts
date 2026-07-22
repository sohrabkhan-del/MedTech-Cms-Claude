import { useState } from 'react'

interface Coordinates {
  latitude: string
  longitude: string
}

export function useGeolocationCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function captureLocation(onCaptured: (coords: Coordinates) => void) {
    if (!navigator.geolocation) {
      setError('Location is not supported on this browser. Enter coordinates manually.')
      return
    }

    setIsCapturing(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCaptured({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        })
        setIsCapturing(false)
      },
      () => {
        setError('Unable to access your location. Please allow location access or enter coordinates manually.')
        setIsCapturing(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return { captureLocation, isCapturing, error }
}
