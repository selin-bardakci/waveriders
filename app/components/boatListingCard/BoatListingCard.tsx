
const BoatListingCard = ({ imageUrl, price, rating, guests, minHours, description }) => {
    return (
      <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
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
    );
  };
  
  export default BoatListingCard;
  
