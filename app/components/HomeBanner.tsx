"use client";
import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import SearchBar from '/components/SearchBar/SearchBar'; // Make sure this is the correct path

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const HomeBanner = () => {
    const [viewport, setViewport] = useState({
        latitude: 41.0082, // Default latitude: Istanbul
        longitude: 28.9784,
        zoom: 12,
    });

    // Set user's current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setViewport({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                zoom: 12,
            });
        });
    }, []);

    return (
        <div className="relative w-full">
            <div className="flex min-h-[480px] flex-col gap-6 items-start justify-end pb-90 rounded-xl">
                {/* Map Container */}
                <Map
                    initialViewState={viewport}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '500px', borderRadius: '1rem' }}
                    onMove={(evt) => setViewport(evt.viewState)}
                >
                    <GeolocateControl position="top-left" />
                </Map>

                {/* Overlay with Welcome Text and Custom SearchBar */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end px-8 py-12 rounded-xl">
                    <div className="text-left mb-4">
                        <h1 className="text-5xl font-bold text-white">Welcome to WaveRiders</h1>
                        <p className="mt-4 text-sm text-white">
                            Rent a boat or explore unique experiences
                        </p>
                    </div>
                    
                    {/* Use the custom SearchBar here */}
                    <div className="w-full">
                        <SearchBar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBanner;
