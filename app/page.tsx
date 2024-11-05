"use client";
import React, { useState, useEffect } from 'react';
import Map, { GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { boatListings } from "@/app/utils/boatListings";
import Container from "@/app/components/Container";
import BoatListingCard from "@/app/components/boatListingCard/BoatListingCard";
import SearchBar from "@/app/components/SearchBar/SearchBar";
import WeatherComponent from "@/app/components/WeatherComponent"; // Import WeatherComponent
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
    const [viewport, setViewport] = useState({
        latitude: 41.0082,
        longitude: 28.9784,
        zoom: 12,
    });

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
        <div className="min-h-screen bg-gray-50">
            <Container>
                {/* Map Section with SearchBar overlay */}
                <div className="relative w-full mb-10">
                    <Map
                        initialViewState={viewport}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        style={{ width: '100%', height: '500px', borderRadius: '1rem' }}
                        onMove={(evt) => setViewport(evt.viewState)}
                    >
                        <GeolocateControl position="top-left" />
                    </Map>

                    {/* SearchBar Overlay at the Top of the Map */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-3xl px-4 z-10 pointer-events-auto">
                        <SearchBar />
                    </div>

                    {/* Weather Component Positioned at Bottom Right of Map */}
                    <div className="absolute bottom-4 right-4">
                        <WeatherComponent latitude={viewport.latitude} longitude={viewport.longitude} />
                    </div>
                </div>

                {/* WaveRiders Recommendations Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-gray-800">WaveRiders recommends for you</div>
                    <Link href="/auth/ListingsPage" className="flex items-center text-blue-500 hover:text-blue-700 transition text-base font-semibold px-3 py-2">
                        <span className="mr-1">See All</span>
                        <FaArrowRight />
                    </Link>
                </div>
                
                {/* Listings in a Single Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                    {boatListings.map((boat) => (
                        <BoatListingCard key={boat.id} {...boat} />
                    ))}
                </div>
            </Container>
        </div>
    );
}
