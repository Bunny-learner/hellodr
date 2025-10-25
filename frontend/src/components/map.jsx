import React from "react";

export default function Map({ address }) {
  // Encode the address to make it URL-safe
  const encodedAddress = encodeURIComponent(address);

  return (
    <div style={{ marginTop: "20px" }}>
      <iframe
        title="Location Map"
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: "12px" }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
      ></iframe>
    </div>
  );
}
