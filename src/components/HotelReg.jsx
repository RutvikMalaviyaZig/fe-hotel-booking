import React, { useState } from "react";
import { assets } from "../assets/assets.js";
import { cities } from "../assets/assets.js";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, axios, getToken, setIsOwner } = useAppContext();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
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
      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        setShowHotelReg(false);
      } else {
        toast.error(data.message);
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
          <button className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition-all duration-500 cursor-pointer mt-6 mr-auto">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
