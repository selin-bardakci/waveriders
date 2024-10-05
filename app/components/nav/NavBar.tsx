import Link from 'next/link';

const NavBar = () => {
    return (
        <div className="sticky top-0 w-full mx-auto bg-white border-b-2 border-gray-300 shadow-md z-30 h-20 p-4 flex items-center rounded-tl-[1rem] rounded-tr-[1rem]">
            <div className="flex w-full justify-between items-center px-6">
                {/* Left side */}
                <Link href="/" className="text-lg font-semibold">WaveRiders</Link>
                
                {/* Right side */}
                <div className="flex items-center gap-8 md:gap-12">
                <Link href="/auth/sign-in" className="px-4">Login</Link>
                <Link href="/auth/register" className="px-4">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default NavBar;