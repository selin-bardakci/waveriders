import FooterList from "./FooterList";
import Link from "next/link"; // Ensure you have the correct import for Link
import {MdFacebook} from "react-icons/md";
import {AiFillTwitterCircle, AiFillInstagram} from "react-icons/ai"

const Footer = () => {
    return (
        <footer className="text-slate-400 text-sm mt-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-center pt-16 pb-3 ">
                    <div className="flex flex-col md:flex-row space-x-20">
                        <Link href="/">About Us</Link>
                        <Link href="/">Terms of Service</Link>
                        <Link href="/">Privacy Policy</Link>
                        <Link href="/">Customer Service</Link>
                    </div>
                </div>
                <div className="flex justify-center py-4 pb-1"    >
                    <Link href = "#" className="text-2xl px-3" > <AiFillInstagram/></Link>
                    <Link href = "#" className="text-2xl px-3"> <AiFillTwitterCircle/></Link>
                    <Link href = "#" className="px-3 text-2xl"> <MdFacebook/></Link>
                  
                    
                </div>
                <div className="flex justify-center py-7">
                <div>©2024 QuickBid. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
