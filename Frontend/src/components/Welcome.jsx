import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] font-poppins overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 bg-white rounded-[20px] shadow-custom-card p-6 sm:p-10 text-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full mx-auto">
        <div className="mb-6">
          <img
            src="/public/logo.jpg"
            alt="TrueYou logo"
            className="mx-auto h-[20rem] sm:h-[20rem] object-contain"
          />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Hi!{" "}
          {localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).full_name
            : ""}
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-8">
          Welcome to TrueYouCareers
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-10">
          We'll be asking you some questions to help guide you on your career
          path.
          <br className="hidden sm:inline" /> Answer them comfortably and
          honestly!
        </p>

        <button
          className="bg-yellow-500 text-white rounded-xl px-8 py-3 text-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:bg-yellow-600 shadow-button-glow hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
          aria-label="Start Questionnaire"
          onClick={() => {
            localStorage.getItem("user")
              ? navigate("/profile/questionnaire")
              : navigate("/auth/signup");
          }}
        >
          Start Questionnaire
        </button>
      </div>
    </div>
  );
};

export default Welcome;
