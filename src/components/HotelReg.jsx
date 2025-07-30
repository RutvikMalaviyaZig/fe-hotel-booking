import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { assets } from "../assets/assets.js";
import { cities } from "../assets/assets.js";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
  marginTop: '8px'
};

const center = {
  lat: 20.5937,  // Default center on India
  lng: 78.9629
};

const HotelReg = () => {
  const { setShowHotelReg, axios, getToken, setIsOwner } = useAppContext();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
  });

  const [map, setMap] = useState(null);

  const onMapClick = useCallback((event) => {
    setCoordinates({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  }, []);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!coordinates.lat || !coordinates.lng) {
      toast.error('Please select a location on the map');
      return;
    }

    try {
      const token = getToken(); // Get the token synchronously
      if (!token) {
        toast.error('Please log in to register a hotel');
        return;
      }

      const { data } = await axios.post(
        '/api/hotels/',
        {
          name,
          contact,
          address,
          city,
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (data?.success) {
        toast.success('Hotel registered successfully!');
        setShowHotelReg(false);
        setIsOwner(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      onClick={() => setShowHotelReg(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex bg-white rounded-xl max-w-4xl max-md:mx-2"
      >
        <img
          src={assets.regImage}
          alt="reg-image"
          className="w-1/2 rounded-xl hidden md:block"
        />

        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10">
          <img
            onClick={() => setShowHotelReg(false)}
            src={assets.closeIcon}
            alt="close-icon"
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
          />
          <p className="text-2xl font-semibold mt-6">Register Your Hotel</p>

          {/* Hotel name*/}
          <div className="w-full mt-4">
            <label htmlFor="name" className="text-gray-500 font-medium">
              Hotel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="name"
              placeholder="Hotel Name"
              required
              className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
            />
          </div>

          {/* Phone */}
          <div className="w-full mt-4">
            <label htmlFor="contact" className="text-gray-500 font-medium">
              Phone
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              id="contact"
              placeholder="Phone"
              required
              className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
            />
          </div>
          {/* Hotel Address*/}
          <div className="w-full mt-4">
            <label htmlFor="address" className="text-gray-500 font-medium">
              Hotel Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              id="address"
              placeholder="Address"
              required
              className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
            />
          </div>
          {/* Select city drop down */}
          <div className="w-full mt-4 max-w-60 mr-auto">
            <label htmlFor="city" className="text-gray-500 font-medium">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              id="city"
              required
              className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          {/* Map Component */}
          <div className="w-full mt-4">
            <label className="text-gray-500 font-medium">
              Select Location on Map
            </label>
            {isLoaded ? (
              <div className="mt-1 border border-gray-200 rounded overflow-hidden">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={coordinates.lat && coordinates.lng ? coordinates : center}
                  zoom={6}
                  onClick={onMapClick}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {coordinates.lat && coordinates.lng && (
                    <Marker position={coordinates} />
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="h-[300px] bg-gray-100 rounded flex items-center justify-center mt-1">
                Loading map...
              </div>
            )}
            {(coordinates.lat && coordinates.lng) && (
              <div className="mt-2 text-sm text-gray-600">
                Selected Location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition-all duration-500 cursor-pointer mt-6 mr-auto"
            disabled={!coordinates.lat || !coordinates.lng}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
