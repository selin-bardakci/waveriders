import { products } from "@/utils/products";
import Container from "./components/Container";
import HomeBanner from "./components/HomeBanner";
import { truncateText } from "@/utils/truncateText";
import ProductCard from "./components/products/ProductCard";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-8">
      <Container>
        <div className= "mb-10">
          <HomeBanner />                                                                                     
        </div>                                                        
       
        <div className="text-xl font-bold text-black mb-10">Featured</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 
        lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          
        </div>
        <div className="text-3xl font-bold text-black flex items-center justify-center pt-20">
          Ready to join the fun?
        </div>

        <div className="flex justify-center mt-6">
          <Link href="/auction-items" legacyBehavior>
            <a className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
             Register Now
            </a>
          </Link>
        </div>
      </Container>
    </div>
  );
}

//for <ProductCard data={product}/ need to configure image from next.config,js
/** 
          {products.map((product: any) => { 
            return <ProductCard data={product}/>;
          })}
 */