import React, { useEffect, useRef, useState } from "react";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";

const GEOAPIFY_KEY = "d53f8e45ee9d4148914e34a05fc1525d";

function LocationSelector() {
  const districtRef = useRef(null);
  const subcountyRef = useRef(null);
  const parishRef = useRef(null);

  const [district, setDistrict] = useState(null);
  const [subcounty, setSubcounty] = useState(null);
  const [parish, setParish] = useState(null);

  useEffect(() => {
    // dynamically load Geoapify script
    const script = document.createElement("script");
    script.src = `https://unpkg.com/@geoapify/geocoder-autocomplete@1.0.1/dist/index.min.js`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // eslint-disable-next-line no-undef
      const districtAutocomplete = new Geoapify.GeocoderAutocomplete(
        districtRef.current,
        GEOAPIFY_KEY,
        { type: "city", countryCodes: ["ug"] }
      );

      districtAutocomplete.on("select", (value) => {
        setDistrict(value.properties);
        setSubcounty(null);
        setParish(null);
      });

      // eslint-disable-next-line no-undef
      const subcountyAutocomplete = new Geoapify.GeocoderAutocomplete(
        subcountyRef.current,
        GEOAPIFY_KEY,
        { type: "county", countryCodes: ["ug"] }
      );

      subcountyAutocomplete.on("select", (value) => {
        setSubcounty(value.properties);
        setParish(null);
      });

      // eslint-disable-next-line no-undef
      const parishAutocomplete = new Geoapify.GeocoderAutocomplete(
        parishRef.current,
        GEOAPIFY_KEY,
        { type: "locality", countryCodes: ["ug"] }
      );

      parishAutocomplete.on("select", (value) => {
        setParish(value.properties);
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2> Farm Location Selector</h2>

      <label>District</label>
      <div ref={districtRef} style={{ marginBottom: "15px" }}></div>

      {district && (
        <>
          <label>Subcounty</label>
          <div ref={subcountyRef} style={{ marginBottom: "15px" }}></div>
        </>
      )}

      {subcounty && (
        <>
          <label>Parish</label>
          <div ref={parishRef} style={{ marginBottom: "15px" }}></div>
        </>
      )}

      {parish && (
        <div
          style={{
            marginTop: "20px",
            background: "#f8f8f8",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <strong>Selected Location:</strong>
          <p>
            District: {district?.city || district?.county} <br />
            Subcounty: {subcounty?.city || subcounty?.county} <br />
            Parish: {parish?.city || parish?.county}
          </p>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;
