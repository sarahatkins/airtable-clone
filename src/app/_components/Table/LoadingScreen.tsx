import React from "react";

interface LoadingScreenProps {
  message?: string; // Optional loading message

}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "...",
}) => {
  return (
    <div className="bg-opacity-90 flex h-full w-full flex-col items-center justify-center bg-white select-none">
      {/* <Image src={loadingGifUrl} alt="Loading..." className="mb-3 h-16 w-16" /> */}
      <svg
        className="h-10 w-10 animate-spin text-slate-500 mb-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="animation-spin font-sans text-sm font-semibold text-neutral-500 text-center">
        <p className="text-xl mb-1">Loading{message}</p>
      </span>
    </div>
  );
};

export default LoadingScreen;
