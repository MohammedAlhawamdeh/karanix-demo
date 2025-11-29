'use client';
/* global google */
import { GoogleMap, MarkerF, PolylineF, useLoadScript } from '@react-google-maps/api';
import React from 'react';
import { Operation, Pax, Vehicle } from '../lib/api';

interface Props {
  operation?: Operation;
  vehicles: Vehicle[];
  pax?: Pax[];
}

const containerStyle = {
  width: '100%',
  height: '340px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid var(--border)'
};

export const MapView = ({ operation, vehicles, pax }: Props) => {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapsKey || ''
  });

  if (!mapsKey) {
    return (
      <div className="card">
        <h3>Live Map</h3>
        <div className="muted" style={{ marginTop: 8 }}>
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the map.
        </div>
      </div>
    );
  }

  if (!operation || !isLoaded || (!vehicles.length && !operation.stops.length)) {
    return (
      <div className="card">
        <h3>Live Map</h3>
        <div className="muted" style={{ marginTop: 8 }}>
          Waiting for map data…
        </div>
      </div>
    );
  }

  const paxPoints = pax || operation.pax || [];
  const primaryVehicle = vehicles.find((v) => v.lastPing?.location);
  const primaryStop = operation.stops[0];
  const center =
    primaryVehicle?.lastPing?.location ||
    primaryStop?.location ||
    paxPoints.find((p) => p.pickupPoint)?.pickupPoint || { lat: 40.75, lng: -73.98 };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Live Map</h3>
        <div className="muted" style={{ fontSize: 12 }}>
          Vehicles & pickups
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{ styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }] }}
        >
          {operation.route?.length > 1 && (
            <PolylineF
              path={operation.route}
              options={{
                strokeColor: '#22d3ee',
                strokeWeight: 4,
                strokeOpacity: 0.7
              }}
            />
          )}
          {operation.stops.map((stop) => (
            <MarkerF
              key={stop.name}
              position={stop.location}
              label={{ text: 'S', color: '#0b1324', fontWeight: '700' }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#fbbf24',
                fillOpacity: 0.9,
                strokeColor: '#0b1324',
                strokeWeight: 2
              }}
            />
          ))}
          {paxPoints
            .filter((p) => p.pickupPoint)
            .map((p) => (
              <MarkerF
                key={p._id}
                position={p.pickupPoint!}
                label={{ text: 'P', color: '#0b1324', fontWeight: '700' }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: '#f97316',
                  fillOpacity: 0.9,
                  strokeColor: '#0b1324',
                  strokeWeight: 2
                }}
              />
            ))}
          {vehicles
            .filter((v) => v.lastPing?.location)
            .map((vehicle) => (
              <MarkerF
                key={vehicle._id}
                position={vehicle.lastPing!.location}
                label={{
                  text: vehicle.name,
                  color: '#0b1324',
                  fontWeight: '700'
                }}
                icon={{
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: '#22d3ee',
                  fillOpacity: 0.9,
                  strokeColor: '#0b1324',
                  strokeWeight: 2
                }}
              />
            ))}
        </GoogleMap>
      </div>
    </div>
  );
};
