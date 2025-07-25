import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
const Dashboard = () => {
  const { axios, getToken, user, toast, currency } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data } = await axios.get(
        `/api/bookings/hotel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data && data.success) {
        setDashboardData({
          bookings: Array.isArray(data.bookings) ? data.bookings : [],
          totalBookings: Number(data?.totalBookings) || 0,
          totalRevenue: Number(data?.totalRevenue) || 0,
        });
      } else {
        const errorMessage = data?.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);

      // If unauthorized, clear the token and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <Title
        title="Dashboard"
        font="outfit"
        subtitle="Monitor your hotel room listings, track booking and analyze revenue-all in one place. Stay updated with real-time insights to ensure smooth operations."
        align="left"
      />
      <div className="flex gap-4 my-8">
        {/*Total Bookings*/}
        <div className="bg-primary/3 border border-promary/10 rounded flex p-4 pr-8">
          <img
            src={assets.totalBookingIcon}
            alt=""
            className="max-sm:hidden h-10"
          />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-500 text-lg">Total Bookings</p>
            <p className="text-netural-400 text-base">
              {dashboardData.totalBookings}
            </p>
          </div>
        </div>
        {/*Total Revenue*/}
        <div className="bg-primary/3 border border-promary/10 rounded flex p-4 pr-8">
          <img src={assets.totalRevenueIcon} alt="" className="w-12 h-12" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-500 text-lg">Total Revenue</p>
            <p className="text-netural-400 text-base">
              {currency}
              {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>
      {/* Recent Bookings */}
      <h2 className="text-xl text-blue-950/70 font-medium mb-5">
        Recent Bookings
      </h2>
      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">User Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Room Name
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Total Amount
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dashboardData.bookings.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {item.user.username}
                </td>
                <td className="py-3 px-4 max-sm:hidden border-t border-gray-300">
                  {item.room.roomType}
                </td>
                <td className="py-3 px-4 text-center border-t border-gray-300">
                  {currency}
                  {item.totalPrice}
                </td>
                <td className="py-3 px-4 border-t border-gray-300 flex">
                  <button
                    className={`py-3 px-3 text-xs rounded-full mx-auto ${item.isPaid
                      ? "bg-green-200 text-green-600"
                      : "bg-yellow-300 text-yellow-600"
                      }`}
                  >
                    {item.isPaid ? "Completed" : "Pending"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
