import { Map, Marker, APIProvider } from '@vis.gl/react-google-maps';

export default function MapPreview({ startCoords, endCoords }) {
    // Parse coordinates
    const parseCoords = (coordString) => {
        if (!coordString) return null;
        const [lat, lng] = coordString.split(',').map(s => parseFloat(s.trim()));
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
    };

    const start = parseCoords(startCoords);
    const end = parseCoords(endCoords);

    // Calculate center point between start and end
    const center = start && end
        ? { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 }
        : start || end || { lat: 14.5995, lng: 120.9842 }; // Default: Manila

    // If no valid coordinates, show message
    if (!start && !end) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                <p className="text-sm text-gray-500">Enter GPS coordinates to preview location</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 rounded border border-gray-300 overflow-hidden">
            <APIProvider apiKey="AIzaSyCjvWF5Q-YIqr-JIHHQibniMwpkIVo-A7A">
                <Map
                    defaultCenter={center}
                    defaultZoom={13}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                >
                    {start && (
                        <Marker
                            position={start}
                            title="Start Point"
                        />
                    )}
                    {end && (
                        <Marker
                            position={end}
                            title="End Point"
                        />
                    )}
                </Map>
            </APIProvider>
        </div>
    );
}
