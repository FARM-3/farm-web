import React, { useState } from "react";
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";

const GEOAPIFY_API_KEY = "14cedd3fa25d49deacc7da7d7f48b00e"; // your key

function LocationSelector({ onLocationChange }) {
  const [location, setLocation] = useState({
    district: "",
    subcounty: "",
    parish: "",
  });

  const handleDistrictSelect = (value) => {
    if (!value?.properties) return;
    const district =
      value.properties.county ||
      value.properties.city ||
      value.properties.state ||
      value.properties.name ||
      "";
    const updated = { ...location, district };
    setLocation(updated);
    onLocationChange(updated);
  };

  const handleSubcountySelect = (value) => {
    if (!value?.properties) return;
    const subcounty =
      value.properties.locality ||
      value.properties.city ||
      value.properties.name ||
      "";
    const updated = { ...location, subcounty };
    setLocation(updated);
    onLocationChange(updated);
  };

  const handleParishSelect = (value) => {
    if (!value?.properties) return;
    const parish =
      value.properties.locality ||
      value.properties.neighbourhood ||
      value.properties.name ||
      "";
    const updated = { ...location, parish };
    setLocation(updated);
    onLocationChange(updated);
  };

  return (
    <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
      <div className="space-y-3 mt-3">
        <label className="block text-sm font-medium text-gray-700">
          District
        </label>
        <GeoapifyGeocoderAutocomplete
          placeholder="Search for district..."
          type="state" // ✅ valid type
          lang="en"
          filterByCountryCode={["ug"]} // ✅ new property
          placeSelect={handleDistrictSelect}
        />

        <label className="block text-sm font-medium text-gray-700">
          Subcounty
        </label>
        <GeoapifyGeocoderAutocomplete
          placeholder="Search for subcounty..."
          type="city" // ✅ valid type
          lang="en"
          filterByCountryCode={["ug"]}
          placeSelect={handleSubcountySelect}
        />

        <label className="block text-sm font-medium text-gray-700">
          Parish
        </label>
        <GeoapifyGeocoderAutocomplete
          placeholder="Search for parish..."
          type="locality" // ✅ valid type
          lang="en"
          filterByCountryCode={["ug"]}
          placeSelect={handleParishSelect}
        />
      </div>
    </GeoapifyContext>
  );
}

export default LocationSelector;
