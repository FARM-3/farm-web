import React, { useEffect } from "react";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";

function LocationSearch({ onSelect }) {
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GEOAPIFY_KEY;
    const autocomplete = new GeocoderAutocomplete(
      document.getElementById("geoapify-autocomplete"),
      apiKey,
      { placeholder: "Type your village..." }
    );

    autocomplete.on("select", (location) => {
      if (onSelect) onSelect(location);
    });
  }, [onSelect]);

  return <div id="geoapify-autocomplete" style={{ width: "100%", maxWidth: "400px" }} />;
}

export default LocationSearch;
