// app/components/WeatherComponent.js
import React, { useEffect, useState } from 'react';

const WeatherComponent = ({ latitude, longitude }) => {
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric`
                );
                const data = await response.json();
                if (response.ok) {
                    setWeatherData(data);
                } else {
                    setError(data.message || "Unable to fetch weather data.");
                }
            } catch (err) {
                setError("Unable to fetch weather data.");
            }
        };

        if (latitude && longitude) {
            fetchWeather();
        }
    }, [latitude, longitude]);

    if (error) return <div className="text-red-500">{error}</div>;

    return weatherData ? (
        <div className="bg-white bg-opacity-90 rounded-lg shadow-md p-4 w-60 text-center">
            <h3 className="text-lg font-bold">Current Weather</h3>
            <p className="text-xl font-semibold">{weatherData.name}</p>
            <div className="text-2xl font-bold">
                {Math.round(weatherData.main.temp)}°C
            </div>
            <p className="capitalize text-gray-700">
                {weatherData.weather[0].description}
            </p>
        </div>
    ) : (
        <div>Loading...</div>
    );
};

export default WeatherComponent;
