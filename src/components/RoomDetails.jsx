import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import StarRating from "./StarRating";
import { facilityIcons, roomCommonData } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const { rooms, axios, getToken } = useAppContext();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkAvailability = async () => {
    // Reset state
    setIsAvailable(false);
    
    // Validate dates first
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select both check-in and check-out dates");
      return;
    }
    
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error("Check-in date must be before check-out date");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make the API request
      const response = await axios.post(
        "/api/bookings/check-availability",
        {
          room: id,
          checkInDate,
          checkOutDate,
        },
        {
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
      
      // Handle successful response (status 2xx)
      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data || {};
        const isRoomAvailable = Boolean(responseData.isAvailable);
        
        setIsAvailable(isRoomAvailable);
        
        // Show appropriate message
        const message = isRoomAvailable 
          ? "Room is available!" 
          : responseData.message || "Room is not available for the selected dates";
          
        toast[isRoomAvailable ? "success" : "error"](message);
        return isRoomAvailable;
      }
      
      // Handle API error responses (status 4xx)
      const errorData = response.data || {};
      const errorMessage = errorData.message || "Failed to check room availability";
      toast.error(errorMessage);
      return false;
      
    } catch (error) {
      // Handle network errors or other exceptions
      let errorMessage = "An error occurred while checking availability";
      
      if (error) {
        // Handle Axios errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = error.response.data?.message || 
                        `Server responded with status ${error.response.status}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Please check your connection.";
        } else {
          // Something happened in setting up the request
          errorMessage = error.message || "Error setting up the request";
        }
      }
      
      toast.error(errorMessage);
      return false;
      
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validate form data before submission
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    
    if (guests < 1) {
      toast.error('Number of guests must be at least 1');
      return;
    }
    
    try {
      // Check availability first if not already done
      if (!isAvailable) {
        const isAvailable = await checkAvailability();
        if (!isAvailable) {
          toast.error('Room is not available for the selected dates');
          return;
        }
      }
      
      // Only proceed with booking if room is available
      const token = getToken();
      if (!token) {
        toast.error('Please log in to book a room');
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }

      // Prepare booking data
      const bookingData = {
        room: id,
        checkInDate: new Date(checkInDate).toISOString().split('T')[0], // Ensure YYYY-MM-DD format
        checkOutDate: new Date(checkOutDate).toISOString().split('T')[0],
        guests: Number(guests) || 1,
        paymentMethod: 'Pay At Hotel'
      };

      // Log the request payload for debugging
      console.log('Sending booking request:', JSON.stringify(bookingData, null, 2));
      
      const response = await axios.post(
        '/api/bookings/book',
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
      
      // Handle successful response (2xx)
      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data || {};
        
        if (responseData.success) {
          toast.success(responseData.message || 'Booking successful!');
          navigate('/my-bookings');
          window.scrollTo(0, 0);
        } else {
          toast.error(responseData.message || 'Failed to book room');
        }
        return;
      }
      
      // Handle error responses (4xx)
      const errorData = response.data || {};
      const errorMessage = errorData.message || 
                         `Booking failed with status ${response.status}`;
      
      // Log full error for debugging
      console.error('Booking API error:', {
        status: response.status,
        data: errorData,
        headers: response.headers
      });
      
      // Handle specific error cases
      if (response.status === 400) {
        if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.values(errorData.errors)
            .map(err => typeof err === 'string' ? err : err.message || 'Invalid field')
            .join('\n');
          toast.error(`Validation error: ${validationErrors}`);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error('Invalid request. Please check your input and try again.');
        }
      } else if (response.status === 401) {
        toast.error('Please log in to continue');
        navigate('/login', { state: { from: window.location.pathname } });
      } else {
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      
      let errorMessage = 'An error occurred while processing your booking';
      
      if (error) {
        // Handle Axios errors
        if (error.response) {
          // Server responded with error status
          const responseData = error.response.data || {};
          errorMessage = responseData.message || 
                        `Server responded with status ${error.response.status}`;
          
          // Handle 400 validation errors
          if (error.response.status === 400 && responseData.errors) {
            const validationErrors = Object.values(responseData.errors)
              .map(err => typeof err === 'string' ? err : err.message || 'Invalid field')
              .join('\n');
            errorMessage = `Validation error: ${validationErrors}`;
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
        } else if (error.message) {
          // Other errors with message
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const room = rooms.find((room) => room._id === id);
    if (room) {
      setRoom(room);
      setMainImage(room.images[0]);
    }
  }, [rooms]);

  useEffect(() => {
    // Only check availability if we have both dates
    if (checkInDate && checkOutDate) {
      checkAvailability();
    }
  }, [checkInDate, checkOutDate, guests, id]);

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Room Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className=" text-3xl md:text-4xl font-playfair">
            {room.hotel.name}
            <span className="font-inter text-sm ml-2">({room.roomType})</span>
          </h1>
          <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            20% OFF
          </p>
        </div>
        {/* Room Rating */}
        <div className="flex items-center gap-1 mt-2">
          <StarRating rating={room.rating} />
          <p className="ml-2">200+ Reviews</p>
        </div>

        {/* Room Address */}
        <div className="flex items-center gap-1 mt-2">
          <img src={assets.locationIcon} alt="location-icon" />
          <p>{room.hotel.address}</p>
        </div>

        {/* Room Images */}
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="w-full lg:w-1/2">
            <img
              src={mainImage}
              alt="room-image"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images.length > 1 &&
              room?.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && "outline-3 outline-orange-500"
                    }`}
                  key={index}
                  src={image}
                  alt="room-image"
                />
              ))}
          </div>
        </div>

        {/* Room Highlights */}
        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col ">
            <h1 className="text-3xl md:text-4xl font-playfair">
              Experience Luxury like Never Before
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {room.amenities.map((item, index) => (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                  key={index}
                >
                  <img
                    src={facilityIcons[item]}
                    alt={item}
                    className="w-5 h-5"
                  />
                  <p className="text-xs">{item}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Room Price */}
          <p className="text-2xl font-medium">${room.pricePerNight}/night</p>
        </div>

        {/* CheckIn CheckOut Form */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-xl shadow-[0px_0px_20px_rgba(0,0,0,0.15)] mt-16 mx-auto max-w-6xl"
        >
          <div className="flex flex-col gap-4 flex-wrap md:flex-row items-start md:items-center md:gap-10 text-gray-500">
            <div className="flex flex-col">
              <label htmlFor="checkInDate" className="font-medium">
                Check-in
              </label>
              <input
                value={checkInDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckInDate(e.target.value)}
                type="date"
                id="checkInDate"
                placeholder="Check-in"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
            <div className="flex flex-col">
              <label htmlFor="checkOutDate" className="font-medium">
                Check-out
              </label>
              <input
                value={checkOutDate}
                min={checkInDate}
                disabled={!checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                type="date"
                id="checkOutDate"
                placeholder="Check-out"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden"></div>
            <div className="flex flex-col">
              <label htmlFor="guests" className="font-medium">
                Guests
              </label>
              <input
                value={guests}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setGuests(isNaN(value) ? 1 : Math.max(1, value));
                }}
                type="number"
                id="guests"
                placeholder="1"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                min={1}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull active:scale-95 transition-all rounded-md text-white cursor-pointer max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base"
          >
            {isAvailable ? "Book Now" : "Check Availability"}
          </button>
        </form>

        {/* Common Specifications */}
        <div className="mt-25 space-y-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-start gap-2">
              <img
                src={spec.icon}
                alt={`${spec.title}-icon`}
                className="w-6.5"
              />
              <div>
                <p className="text-base">{spec.title}</p>
                <p className="text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
          <p>
            Guests will be allocated on the ground floor according to
            availability. You get a comfortable Two bedroom apartment has a true
            city feeling. The price quoted is for two guest, at the guest slot
            please mark the number of guests to get the exact price for groups.
            The Guests will be allocated ground floor according to availability.
            You get the comfortable two bedroom apartment that has a true city
            feeling.
          </p>
        </div>

        {/* Posted By */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <img
              src={room.hotel.owner.image}
              alt="Host"
              className="w-14 h-14 rounded-full md:h-18 md:w-18"
            />
            <div>
              <p className="text-lg md:text-xl">
                Hosted by <b>{room.hotel.name}</b>
              </p>
              <div className="flex items-center mt-1">
                <StarRating rating={room.rating} />
                <p className="ml-2">200+ Reviews</p>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer">
            Contact Now
          </button>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
