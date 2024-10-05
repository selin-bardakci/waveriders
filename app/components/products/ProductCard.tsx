'use client';
import { useRouter } from "next/navigation";
import { formatPrice } from '@/utils/formatPrice';
import Image from 'next/image';
import { truncateText } from '@/utils/truncateText';

interface ProductCardProps {
  data: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(`/product/${data.id}`)} // Correct onClick placement and syntax
      className="col-span-1 cursor-pointer 
        border-[1.2px] border-slate-200
        bg-slate-50 
        rounded-lg p-2 transition hover:scale-105 hover:shadow-xl
        text-center text-sm"
    >
      <div className="flex flex-col items-center w-full gap-1">
        <div className="aspect-square overflow-hidden relative w-full"> 
          <Image 
            fill 
            src={data.images[0].image}
            alt="Product Image"
            className="object-contain" 
          />
        </div>
        <div className="mt-4"></div>
        <div className="text-base font-medium break-words">
          {truncateText(data.name)}
        </div>
        <div className="bg-slate-50">
          Current bid: {formatPrice(data.startingPrice)}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
