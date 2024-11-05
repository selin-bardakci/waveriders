import Image from 'next/image';

export default function ProductCard({ data }) {
    // Set a fallback image if `data.images` is missing or empty
    const imageUrl = data.images && data.images[0]?.image 
        ? data.images[0].image 
        : "/images/fallback-image.jpg"; // Provide a path to a default fallback image

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Image 
                fill
                src={imageUrl} 
                alt={data.name || "Boat Image"} // Fallback alt text
                className="w-full h-48 object-cover" 
            />
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">{data.name || "Boat"}</h3>
                <p className="text-gray-500">{data.price || "Price not available"}</p>
                <p className="text-yellow-500">{data.rating || "No rating available"}</p>
            </div>
        </div>
    );
}

