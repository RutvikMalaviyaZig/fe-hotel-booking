import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Navbar = () => {
    return (
        <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-3 bg-white transition-all duration-300'>
            <Link to="/">
                <img src={assets.logo} alt="logo" className='h-9 invert opacity-80' />
            </Link>
            <div className="flex items-center gap-4">
                <Link to="/owner/list-room" className="text-gray-600 hover:text-black">My Rooms</Link>
                <Link to="/owner/add-room" className="text-gray-600 hover:text-black">Add Room</Link>
                <Link to="/" className="text-gray-600 hover:text-black">View Site</Link>
            </div>
        </div>
    );
};

export default Navbar;