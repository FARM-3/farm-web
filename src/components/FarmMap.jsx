import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Default center (Namayumba, Wakiso)
const center = { lat: 0.4837, lng: 32.2783 };

function FarmMap() {
  const GEOAPIFY_API_KEY = "d53f8e45ee9d4148914e34a05fc1525d";

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        {/* Use Geoapify map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
          url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`}
        />

        <Marker position={center}>
          <Popup>
             <strong>My Farm</strong> <br /> Namayumba, Wakiso District
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default FarmMap;
