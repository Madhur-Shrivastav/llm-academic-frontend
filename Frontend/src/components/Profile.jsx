import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [LLMProfile, setLLMProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUser(user);
        if (user.llm_profile) {
          setLLMProfile(user.llm_profile);
        } else {
          setLLMProfile(JSON.parse(localStorage.getItem("llm_profile")));
        }
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

  // console.log(user);
  // console.log(LLMProfile);

  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="/public/image.png"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500 mb-4"
          />
          <h1 className="text-3xl font-bold text-blue-600">{user.full_name}</h1>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 w-full">
          <div className="flex justify-center items-center mb-4">
            <h2 className="text-[22px] font-semibold text-yellow-700">
              Personal Information
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-[20.5px] font-semibold text-yellow-700">
              Email:
              <span className="text-gray-700"> {user.email}</span>
            </p>
            <p className="text-[20.5px] font-semibold text-yellow-700">
              Contact:
              <span className="text-gray-700"> {user.contact}</span>
            </p>
            <p className="text-[20.5px] font-semibold text-yellow-700">
              Grade:
              <span className="text-gray-700"> {user.education_level}</span>
            </p>
          </div>
        </div>

        {user.education_level === "9th or 10th" &&
          LLMProfile.profile_in_a_gist && (
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[34px] font-bold text-indigo-700 mb-3 text-center underline">
                Your Progress So far
              </h3>
              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Subjects you are good at:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.subjects_good_at.map(
                    (subject, index) => (
                      <li key={index}>{subject}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Natural Calling:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  <li>{LLMProfile.profile_in_a_gist.natural_calling}</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Naturally inclined to pursue:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.inclined_to_pursue.map(
                    (inclination, index) => (
                      <li key={index}>{inclination}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Roadblocks:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.roadblocks.map(
                    (roadblock, index) => (
                      <li key={index}>{roadblock}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 text-base sm:text-[22px] leading-relaxed">
                  <strong className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                    Encouragement:
                  </strong>{" "}
                  {LLMProfile.profile_in_a_gist.encouragement}
                </p>
              </div>
            </div>
          )}

        {user.education_level === "11th or 12th" &&
          LLMProfile.profile_in_a_gist && (
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[34px] font-bold text-indigo-700 mb-3 text-center underline">
                Your Progress So far
              </h3>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Career Paths:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.career_paths.map(
                    (path, index) => (
                      <li key={index}>{path}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Strengths:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.strengths.map(
                    (strength, index) => (
                      <li key={index}>{strength}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Exams to Consider:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {LLMProfile.profile_in_a_gist.exams_to_consider.map(
                    (exam, index) => (
                      <li key={index}>{exam}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 text-base sm:text-[22px] leading-relaxed">
                  <strong className="text-indigo-600 text-[26.5px] font-semibold underline">
                    Roadblock:
                  </strong>{" "}
                  {LLMProfile.profile_in_a_gist.roadblock}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 text-base sm:text-[22px] leading-relaxed">
                  <strong className="text-indigo-600 text-[26.5px] font-semibold underline">
                    Suggestion:
                  </strong>{" "}
                  {LLMProfile.profile_in_a_gist.suggestion}
                </p>
              </div>

              <div>
                <p className="text-gray-800 text-base sm:text-[22px] leading-relaxed">
                  <strong className="text-indigo-600 text-[26.5px] font-semibold underline">
                    Final Note:
                  </strong>{" "}
                  {LLMProfile.profile_in_a_gist.final_note}
                </p>
              </div>
            </div>
          )}
        {user.education_level === "Graduation" && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-10 tracking-wide text-center underline">
              Your Progress So far
            </h1>

            <div className="space-y-8 mb-12">
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                <h3 className="text-[30px] font-bold text-yellow-700">
                  Your Natural Inclination:
                </h3>
                <span className="text-gray-800 text-base sm:text-[23px] leading-tight">
                  {LLMProfile.your_natural_inclination}
                </span>
              </div>

              {LLMProfile.careers_that_fit_you_well?.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                  <h3 className="text-[30px] font-bold text-blue-700 mb-1">
                    Careers that Fit you well:
                  </h3>
                  <ul className="list-disc list-inside text-gray-800 space-y-3">
                    {LLMProfile.careers_that_fit_you_well.map((step, index) => (
                      <li key={index} className="text-base sm:text-[23px]">
                        <span className="capitalize leading-tight font-bold">
                          {step.split("-")[0]} -
                        </span>{" "}
                        <span className="leading-tight">
                          {step.split("-")[1]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                <h3 className="text-[30px] font-bold text-yellow-700">
                  Your Degree already helps in:
                </h3>
                <p className="text-gray-800 text-base sm:text-[23px] leading-tight">
                  {LLMProfile.your_degree_already_helps}
                </p>
              </div>

              {LLMProfile.what_you_can_do_next?.length > 0 && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                  <h3 className="text-[30px] font-bold text-green-700 mb-3">
                    Recommended Next Steps:
                  </h3>
                  <ul className="list-disc list-inside text-gray-800 space-y-2">
                    {LLMProfile.what_you_can_do_next.map((step, index) => (
                      <li
                        key={index}
                        className="text-base sm:text-[23px] leading-tight"
                      >
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                <h3 className="text-[30px] font-bold text-yellow-700">
                  Self Reflection:
                </h3>
                <span className="text-gray-800 text-base sm:text-[23px] leading-tight">
                  {LLMProfile.self_reflection}
                </span>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border border-red-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
                <h3 className="text-[30px] font-bold text-red-700">
                  Final Word:
                </h3>
                <span className="text-gray-800 text-base sm:text-[23px] leading-tight">
                  {LLMProfile.final_word}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300 cursor-default mt-2 mb-5">
          <h3 className="text-[30px] font-semibold mb-1">
            📞 Confusion हटाओ, Clarity लाओ
          </h3>
          <p className="text-[24px] mb-2">
            Talk to our{" "}
            <span className="font-medium">Academic Counseling Expert</span>
          </p>
          <p className="text-[24px] font-semibold">
            Call us at:{" "}
            <a href="tel:7454848040" className="text-blue-600 hover:underline">
              7454848040
            </a>
          </p>
        </div>

        <button
          onClick={() => navigate("/chat")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 hover:scale-105 text-gray-800 font-bold py-3 px-6 rounded-full transition-all duration-300"
        >
          Back to Chat
        </button>
      </div>
    </div>
  );
};

export default Profile;
