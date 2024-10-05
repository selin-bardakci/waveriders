const HomeBanner = () => {
    return ( 
        <div className="relative w-full">
            <div 
                className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-4 pb-10 rounded-xl"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("/images/banner.png")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '1rem', // Apply rounded edges
                }}
            >
                <div className="px-8 py-12 flex flex-col gap-2 items-start">
                    <div className="text-left">
                        <h1 className="text-5xl font-bold text-white">Welcome to QuickBid</h1>
                        <p className="mt-4 text-sm text-white">
                            Bid on unique items and experiences, or create your own account
                        </p>
                    </div>
                
                    {/* Search Bar Container */}
                    <div className="mt-4 flex justify-start w-full max-w-[560px]">
                        <label className="flex min-w-40 h-12 w-full md:h-30">
                            <div className="flex w-full items-center rounded-lg h-full border border-[#cedbe8] bg-slate-50">
                                {/* Magnifying Glass  */}
                                <div className="text-[#49719c] flex items-center justify-center pl-3 rounded-l-xl h-full ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                        <path
                                            d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                                        ></path>
                                    </svg>
                                </div>
                               
                                <input
                                    type="text"
                                    placeholder="Search auctions"
                                    className="flex-1 px-4 py-2 text-sm bg-slate-50 text-[#0d141c] placeholder:text-[#49719c] focus:outline-none focus:ring-0"
                                />
                                {/* Search Button */}
                                <button className="bg-blue-500 text-white px-4 py-2.5 text-sm rounded-r-lg rounded-l-lg mr-1">
                                    Search
                                </button>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeBanner;
