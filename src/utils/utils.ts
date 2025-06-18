
export const getCurrentFormattedDateTime = (convertdate?: number) => {
    const date = convertdate ? new Date(convertdate) : new Date();

    // Extract year, month, day, hours, minutes, and seconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Format into the desired string
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
};