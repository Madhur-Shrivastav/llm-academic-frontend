import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem("llm_profile");
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
      } else {
        setError("No profile data found. Please complete the questionnaire.");
      }
    } catch (e) {
      console.error("Failed to parse profile data from session storage", e);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = useNavigate();

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

  if (!profileData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins">
        <p className="text-xl text-gray-700">No profile data available.</p>
      </div>
    );
  }

  const {
    profile_summary,
    potential_career_paths,
    interest_distribution,
    identified_keywords,
    recommended_next_steps,
    personality_scores,
  } = profileData;

  const getTopInterests = (interests, topN = 2) => {
    if (!interests) return "Not specified";
    return Object.entries(interests)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([key]) => key.replace("_", " "))
      .join(", ");
  };

  const currentSubjects = getTopInterests(interest_distribution);
  const recommendedCareer =
    potential_career_paths && potential_career_paths.length > 0
      ? potential_career_paths[0].path
      : "Not specified";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-white pt-12 md:pt-24 pb-12 font-poppins px-5 sm:px-8 lg:px-16">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md md:max-w-3xl w-full mx-auto">
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo.jpg" // Ensure this path is correct, might need to be /public/logo.jpg or imported
            alt="TrueYou logo"
            className="h-48 sm:h-56 md:h-64 object-contain"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-10 tracking-wide text-center">
          Final Results
        </h1>

        <div className="space-y-8 mb-12">
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <p className="text-gray-900 text-lg sm:text-xl font-semibold">
              Your top interest areas:{" "}
              <span className="font-bold text-yellow-600">
                {currentSubjects}
              </span>
            </p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <p className="text-gray-900 text-lg sm:text-xl font-semibold">
              You are naturally inclined to pursue this career:{" "}
              <span className="font-bold text-yellow-600">
                {recommendedCareer}
              </span>
            </p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
              {profile_summary ||
                "Based on your responses, we've identified key strengths and areas of interest. Consider exploring these further to align with your aspirations."}
            </p>
          </div>

          {identified_keywords && identified_keywords.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                Identified Keywords:
              </h3>
              <div className="flex flex-wrap gap-2">
                {identified_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommended_next_steps && recommended_next_steps.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-xl font-semibold text-green-700 mb-3">
                Recommended Next Steps:
              </h3>
              <ul className="list-disc list-inside text-gray-800 space-y-2">
                {recommended_next_steps.map((step, index) => (
                  <li key={index} className="text-base sm:text-lg">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {personality_scores && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">
                Personality Insights:
              </h3>
              {typeof personality_scores === "string" ? (
                <p className="text-gray-800 text-base sm:text-lg">
                  {personality_scores}
                </p>
              ) : (
                <ul className="list-disc list-inside text-gray-800 space-y-1">
                  {Object.entries(personality_scores).map(([key, value]) => (
                    <li key={key} className="text-base sm:text-lg">
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      {String(value)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center">
          If you need any further assistance, feel free to talk to our{" "}
          <span className="font-semibold text-yellow-600">career expert!</span>
        </p>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/chat")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Go to Chat with Career Expert
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
