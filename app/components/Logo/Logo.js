import React from "react";


/* Don't forget to download the CSS file too 
OR remove the following line if you're already using Tailwind */

import "./style.css";

export const Logo = () => {
  return (
<div className="w-[80px] bg-white rounded-md flex items-center justify-center p-4">
  <span className="material-symbols-outlined text-blue-500 text-4xl">sailing</span>
</div>
  )
}

