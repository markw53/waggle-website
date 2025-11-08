import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Dog } from '@/types/dog';
import { Link } from 'react-router-dom';
import { getDogProfileRoute } from '@/config/routes';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix default marker icon
type LeafletIconDefault = typeof L.Icon.Default.prototype & {
  _getIconUrl?: () => string;
};

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper: Calculate distance between two coordinates (Haversine formula)
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Component to recenter map when center changes
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function DogsMap() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([54.5, -4.5]); // ✅ GB center (near Lake District)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50); // Default 50km radius
  const [showRadius, setShowRadius] = useState(false);

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);
          setCenter(userCoords);
          setShowRadius(true);
          toast.success('Location detected!');
        },
        () => {
          toast('Using default GB location', {
            icon: 'ℹ️',
            });
        }
      );
    }
  }, []);

  // Fetch dogs from Firestore
  useEffect(() => {
    const fetchDogsWithLocation = async () => {
      setLoading(true);
      try {
        const dogsRef = collection(db, 'dogs');
        const q = query(
          dogsRef,
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);

        const dogsList: Dog[] = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Dog))
          .filter(dog => dog.location?.lat && dog.location?.lng);

        setDogs(dogsList);
        setFilteredDogs(dogsList);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching dogs:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDogsWithLocation();
  }, []);

  // Filter dogs by radius
  useEffect(() => {
    if (!userLocation || !showRadius) {
      setFilteredDogs(dogs);
      return;
    }

    const filtered = dogs.filter(dog => {
      if (!dog.location) return false;
      const distance = getDistanceInKm(
        userLocation[0],
        userLocation[1],
        dog.location.lat,
        dog.location.lng
      );
      return distance <= radiusKm;
    });

    setFilteredDogs(filtered);
  }, [dogs, userLocation, radiusKm, showRadius]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🗺️ Dogs Near You
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredDogs.length} dog{filteredDogs.length !== 1 ? 's' : ''} available
              {showRadius && ` within ${radiusKm}km`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Radius filter */}
            {userLocation && (
              <div className="flex items-center gap-2">
                <label htmlFor="radius" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Radius:
                </label>
                <select
                  id="radius"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={200}>200 km</option>
                  <option value={500}>All UK</option>
                </select>
              </div>
            )}

            {/* Toggle radius display */}
            {userLocation && (
              <button
                onClick={() => setShowRadius(!showRadius)}
                className="px-3 py-1 text-sm bg-amber-700 hover:bg-amber-600 text-white rounded-md"
              >
                {showRadius ? 'Hide' : 'Show'} Radius
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '600px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* User location circle */}
        {userLocation && showRadius && (
          <Circle
            center={userLocation}
            radius={radiusKm * 1000} // Convert km to meters
            pathOptions={{
              color: '#8c5628',
              fillColor: '#8c5628',
              fillOpacity: 0.1,
            }}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="p-2 text-center">
                <p className="font-semibold">📍 Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dog markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {filteredDogs.map(dog => (
            dog.location && (
              <Marker
                key={dog.id}
                position={[dog.location.lat, dog.location.lng]}
              >
                <Popup maxWidth={250}>
                  <div className="p-2">
                    <div className="flex items-center gap-3 mb-2">
                      {dog.imageUrl && (
                        <img
                          src={dog.imageUrl}
                          alt={dog.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{dog.name}</h3>
                        <p className="text-sm text-gray-600">
                          {dog.breed} • {dog.gender}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dog.location.city && `${dog.location.city}, `}
                          {dog.location.county || dog.location.postcode}
                        </p>
                        {userLocation && (
                          <p className="text-xs text-amber-700 font-semibold mt-1">
                            {getDistanceInKm(
                              userLocation[0],
                              userLocation[1],
                              dog.location.lat,
                              dog.location.lng
                            ).toFixed(1)} km away
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      to={getDogProfileRoute(dog.id)}
                      className="block w-full text-center bg-amber-700 hover:bg-amber-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}