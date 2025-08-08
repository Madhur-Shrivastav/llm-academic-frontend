import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Result_10 from "./Result_10th";
import Result_12 from "./Result_12th";
import Result_Graduate from "./Result_Graduate";

const Result = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [educationLevel, setEducationLevel] = useState(null);

  useEffect(() => {
    const storedEducation = sessionStorage.getItem("education_level");
    if (storedEducation) {
      setEducationLevel(storedEducation);
      setLoading(!loading);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins">
        <p className="text-xl text-gray-700">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-md max-w-md text-center">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {educationLevel === "9th" || educationLevel === "10th" ? (
        <Result_10 />
      ) : educationLevel === "11th" || educationLevel === "12th" ? (
        <Result_12 />
      ) : (
        <Result_Graduate />
      )}
    </>
  );
};

export default Result;
