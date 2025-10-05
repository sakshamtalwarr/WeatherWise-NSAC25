import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

const SearchField = ({ onLocationFound }) => {
    const map = useMap();
    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({ provider, style: 'bar', showMarker: false, autoClose: true });
        map.addControl(searchControl);
        map.on('geosearch/showlocation', (e) => onLocationFound({ lat: e.location.y, lng: e.location.x }));
        return () => map.removeControl(searchControl);
    }, [map, onLocationFound]);
    return null;
};

const MapEvents = ({ onMapMove }) => {
    useMapEvents({
        moveend: (e) => { onMapMove(e.target.getCenter()); },
    });
    return null;
};

function MapComponent({ center, onMapMove, markerPosition, markerKey, userLocationIcon, isMapLocked, onSearchFound, setMapInstance }) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={!isMapLocked}
            dragging={!isMapLocked}
            whenCreated={setMapInstance}
            className="map-container"
        >
            <div className="map-pin-fixed"><div className="map-pin"></div></div>
            <LayersControl position="topright" />
            <SearchField onLocationFound={onSearchFound} />
            <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {markerPosition && <Marker key={markerKey} position={markerPosition} icon={userLocationIcon} />}
            <MapEvents onMapMove={onMapMove} />
        </MapContainer>
    );
}

export default MapComponent;