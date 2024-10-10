"use client";
import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Fixed syntax

const HomeBanner = () => {
    const [viewport, setViewport] = useState({
        latitude: 41.0082, // Default latitude: Istanbul
        longitude:  28.9784, // Default longitude
        zoom: 12,
    });

    // Get user's current location when the component mounts
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setViewport({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                zoom: 12, // Adjust zoom level based on preference
            });
        });
    }, []);

    return ( 
        <div className="relative w-full">
            <div className="flex min-h-[480px] flex-col gap-6 items-start justify-end  pb-90 rounded-xl">
                {/* Map Container */}
                <Map
                    initialViewState={viewport}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN} // Using the correct token
                    style={{ width: '100%', height: '500px', borderRadius: '1rem' }} 
                    onMove={(evt) => setViewport(evt.viewState)}
                >
                    <GeolocateControl position="top-left" />
                </Map>

                {/* Overlay for Welcome Text and Search */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end px-8 py-12 rounded-xl">
                    <div className="text-left">
                        <h1 className="text-5xl font-bold text-white">Welcome to WaveRiders</h1>
                        <p className="mt-4 text-sm text-white">
                            Bid on unique items and experiences
                        </p>
                    </div>
                    
                    {/* Search Bar Container */}
                    <div className="mt-4 flex justify-start w-full max-w-[560px]">
                        <label className="flex min-w-40 h-12 w-full md:h-30">
                            <div className="flex w-full items-center rounded-lg h-full border border-[#cedbe8] bg-slate-50">
                                {/* Magnifying Glass  */}
                                <div className="text-[#49719c] flex items-center justify-center pl-3 rounded-l-xl h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="w-5 h-5">
                                        <path
                                            d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                                        ></path>
                                    </svg>
                                </div>
                               
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="flex-1 px-4 py-2 text-sm bg-slate-50 text-[#0d141c] placeholder:text-[#49719c] focus:outline-none focus:ring-0"
                                />
                                <button className="bg-blue-500 text-white px-4 py-2.5 text-sm rounded-r-lg rounded-l-lg mr-1">
                                    Search
                                </button>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeBanner;
