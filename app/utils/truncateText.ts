export const truncateText = 
(str: string) =>{
    if(str.length < 50) return str

    return str.substring(0,25)+"...";
}