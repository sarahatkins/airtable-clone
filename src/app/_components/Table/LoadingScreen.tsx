import Image from "next/image";
import React from "react";

interface LoadingScreenProps {
  loadingGifUrl?: string; // URL of the loading GIF
  message?: string; // Optional loading message
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  loadingGifUrl = "https://media.giphy.com/media/sSgvbe1m3n93G/giphy.gif", // default GIF, you can replace this with your own
  message = "Loading...",
}) => {
  return (
    <div className="bg-opacity-90 flex h-full w-full flex-col items-center justify-center bg-white select-none">
      {/* <Image src={loadingGifUrl} alt="Loading..." className="mb-3 h-16 w-16" /> */}
      <span className="font-sans text-sm font-semibold text-gray-600">
        {message}
      </span>
    </div>
  );
};

export default LoadingScreen;
