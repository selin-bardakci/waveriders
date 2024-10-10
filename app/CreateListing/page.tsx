'use client';

import axios from 'axios';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Work_Sans } from 'next/font/google';



// Define the type for rental listings
interface RentalListing {
    boatName: string;
    boatId: string; // Keep boatId here as part of the state type, but it's server-generated
    description: string;
    pricePerHour: number;
    rentalDuration: number;
    imageUrl: string; // Add image URL property
}

const RentalListingsPage = () => {
    const [rentalListings, setRentalListings] = useState<RentalListing[]>([]);
    const [boatName, setBoatName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [pricePerHour, setPricePerHour] = useState<string>('');
    const [rentalDuration, setRentalDuration] = useState<string>('1'); // Set default rental duration
    const [images, setImages] = useState<File[]>([]); // For multiple images

    const router = useRouter();

    useEffect(() => {
        const fetchRentalListings = async () => {
            try {
                const response = await axios.get<RentalListing[]>('http://localhost:8081/api/rentals/rental-listings');
                setRentalListings(response.data);
            } catch (error) {
                console.error('Error fetching rental listings:', error);
            }
        };
        fetchRentalListings();
    }, []);

    const handleAddListing = async (e: FormEvent) => {
        e.preventDefault();
    
        if (images.length === 0) {
            console.error('Please upload at least one image.');
            return;
        }
    
        const formData = new FormData();
        formData.append('boatName', boatName);
        formData.append('description', description);
        formData.append('pricePerHour', pricePerHour);
        formData.append('rentalDuration', rentalDuration);
        
        images.forEach((image) => {
            formData.append('images', image); // Ensure 'images' matches the Multer field name
        });
    
        try {
            const response = await axios.post('http://localhost:8081/api/rentals/create_rental', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            if (response.status === 201) {
                setRentalListings([...rentalListings, response.data]);
                setBoatName('');
                setDescription('');
                setPricePerHour('');
                setRentalDuration('1'); // Reset to default value
                setImages([]); // Clear images
                router.refresh(); // Consider using a state update or re-fetch instead of full page refresh
            } else {
                console.warn('Unexpected response status:', response.status);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.message);
            } else {
                console.error('Unknown error:', error);
            }
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files)); // Convert FileList to an array
        }
    };

    return (
        <div className="mt-20 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create your own rental listing</h2>

                {/* Form to add new rental listing */}
                <form onSubmit={handleAddListing} className="mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Boat Name</label>
                        <input
                            type="text"
                            value={boatName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBoatName(e.target.value)}
                            className="mt-1 p-2 block w-full bg-gray-100 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            className="mt-1 p-2 block w-full bg-gray-100 rounded-lg"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Price Per Hour</label>
                        <input
                            type="number"
                            value={pricePerHour}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPricePerHour(e.target.value)}
                            className="mt-1 p-2 block w-full bg-gray-100 rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Rental Duration (in hours)</label>
                        <input
                            type="range"
                            min="1"
                            max="72"
                            value={rentalDuration}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setRentalDuration(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer bg-blue-200"
                        />
                        <div className="text-center mt-2 text-sm font-medium text-gray-700">
                            {rentalDuration} hours
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleImageChange}
                            className="hidden" // Hide the default file input
                            accept="image/*"
                            multiple
                            required
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('file-upload')?.click()} // Trigger the file input click
                            className="p-1 w-full bg-gray-100 text-gray rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Choose Images
                        </button>
                        {/* Display selected file names */}
                        {images.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                                {images.map((image, index) => (
                                    <div key={index}>{image.name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                        Add Listing
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentalListingsPage;
