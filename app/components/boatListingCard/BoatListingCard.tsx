import Link from 'next/link';

interface BoatListingCardProps {
  id: string;
  imageUrl: string;
  price: number;
  rating: number;
  guests: number;
  minHours: number;
  description: string;
}

const BoatListingCard: React.FC<BoatListingCardProps> = ({ id, imageUrl, price, rating, guests, minHours, description }) => {
  return (
    <Link href={`/listings/${id}`} passHref>
      <div className="bg-white border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
        <img src={imageUrl} alt="Boat" className="w-full h-40 object-cover" />
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">${price}/hr</h3>
            <span className="text-sm text-gray-500">Rating: {rating} ({guests} guests)</span>
          </div>
          <p className="text-gray-600 mt-2">{description}</p>
          <p className="text-gray-600">Min. hours: {minHours}</p>
        </div>
      </div>
    </Link>
  );
};

export default BoatListingCard;
