import FooterList from "./FooterList";
import Link from "next/link"; // Ensure you have the correct import for Link
import { MdFacebook } from "react-icons/md";
import { AiFillTwitterCircle, AiFillInstagram } from "react-icons/ai";

const Footer = () => {
    return (
        <footer className="text-slate-400 text-sm mt-0">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-center pt-16 pb-3">
                    <div className="flex flex-col md:flex-row space-x-20">
                        <Link href="/AboutUs">About Us</Link>
                        <Link href="/terms">Terms of Service</Link>
                    </div>
                </div>
                <div className="flex justify-center py-4 pb-1">
                    {/* Non-clickable Social Media Icons */}
                    <div className="text-2xl px-3 text-slate-400"><AiFillInstagram /></div>
                    <div className="text-2xl px-3 text-slate-400"><AiFillTwitterCircle /></div>
                    <div className="text-2xl px-3 text-slate-400"><MdFacebook /></div>
                </div>
                <div className="flex justify-center py-7">
                    <div>©2024 WaveRiders. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
