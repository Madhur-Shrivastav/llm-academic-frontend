import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  senior_secondary_questions,
  tenth_grade_questions,
  graduate_questions,
} from "../assets/Questions";

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [educationLevel, setEducationLevel] = useState(null);
  const [user_id, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const level = parsedUser.education_level;

        if (level) {
          setEducationLevel(level);
          sessionStorage.setItem("education_level", level);
          setUserId(parsedUser.id);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    } else {
      console.error("User not found in localStorage");
      navigate("/auth/login");
    }
  }, [navigate]);

  console.log(educationLevel.education_level);
  useEffect(() => {
    if (user_id) {
      setFormData((prev) => ({ ...prev, user_id }));
    }
  }, [user_id]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!educationLevel) return;

    let selectedQuestions = [];
    if (educationLevel === "9th or 10th") {
      selectedQuestions = tenth_grade_questions;
    } else if (educationLevel === "11th or 12th") {
      selectedQuestions = senior_secondary_questions;
    } else {
      selectedQuestions = graduate_questions;
    }

    setQuestions(selectedQuestions);

    setFormData((prev) => {
      const initData = {};
      selectedQuestions.forEach((q) => {
        initData[q.name] = "";
      });
      return { ...prev, ...initData };
    });
  }, [educationLevel]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center py-10 px-4 sm:px-8 font-poppins">
      <div className="mb-8 flex flex-col items-center">
        <img
          src="/logo.jpg"
          alt="TrueYou Careers"
          className="h-[18rem] sm:h-[20rem] mb-2"
        />
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {questions.map(({ title, prompt, options, name }) => (
          <QuestionCard
            key={name}
            title={title}
            prompt={prompt}
            options={options}
            selected={formData[name]}
            onSelect={(value) => handleChange(name, value)}
          />
        ))}
        <button
          className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full"
          onClick={async () => {
            const isFormComplete = Object.keys(formData)
              .filter((key) => key !== "user_id")
              .every((key) => formData[key] !== "");

            if (isFormComplete) {
              try {
                const { user_id, ...answers } = formData; // Renamed from raw_responses to answers to match snippet

                // Map frontend education levels to backend format
                let backendEducationLevel = "graduate"; // default
                if (educationLevel) {
                  const level = educationLevel;
                  if (level === "9th or 10th") {
                    backendEducationLevel = "10th";
                  } else if (level === "11th or 12th") {
                    backendEducationLevel = "12th";
                  } else {
                    // Assuming 'graduate' or other values map to 'graduate'
                    backendEducationLevel = "graduate";
                  }
                }

                // Prepare questions_data for better LLM analysis
                const questionsData = {};
                questions.forEach((question, index) => {
                  const questionId = question.name || `q${index + 1}`;
                  questionsData[questionId] = {
                    text: question.prompt,
                    options: question.options
                      ? question.options.reduce((opts, option, optIndex) => {
                          opts[String.fromCharCode(97 + optIndex)] = option; // a, b, c, d...
                          return opts;
                        }, {})
                      : {},
                    category: question.name, // Assuming q.name can serve as category
                  };
                });

                const payload = {
                  user_id,
                  education_level: backendEducationLevel, // String, not object
                  raw_responses: answers,
                  questions_data: questionsData,
                };

                console.log("Sending payload:", payload); // Debug log

                const response = await fetch(
                  `${import.meta.env.VITE_API_URL}profile/questionnaire`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  }
                );

                if (response.ok) {
                  const result = await response.json();
                  console.log("Success:", result);

                  // Store the LLM profile for the Result component
                  sessionStorage.setItem(
                    "llm_profile",
                    JSON.stringify(result.llm_profile)
                  );
                  sessionStorage.setItem("questionnaire_id", result.id);

                  navigate(`/result`); // Navigate to results page
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Server error:", errorData);
                  alert(
                    "Something went wrong submitting your answers: " +
                      (errorData.detail || "Unknown error")
                  );
                }
              } catch (error) {
                console.error("Submission failed", error);
                if (
                  error.message.includes("CORS") ||
                  error.name === "TypeError"
                ) {
                  alert(
                    "Network error: Please check your internet connection and try again. If the problem persists, contact support."
                  );
                } else {
                  alert(
                    "An error occurred during submission: " + error.message
                  );
                }
              }
            } else {
              alert("Please answer all questions before proceeding.");
            }
          }}
        >
          Let's get started!
        </button>
      </div>
    </div>
  );
};

const QuestionCard = ({ title, prompt, options, selected, onSelect }) => (
  <div className="rounded-2xl border border-yellow-100 bg-yellow-100 p-5 shadow">
    <h2 className="text-lg font-semibold text-blue-800 mb-2">{title}</h2>
    <p className="text-gray-800 font-medium mb-4">{prompt}</p>
    <div className="flex flex-wrap gap-3">
      {options && options.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                selected === option
                  ? "bg-blue-600 text-white"
                  : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={selected || ""}
          onChange={(e) => onSelect(e.target.value)}
          rows={4}
          placeholder="Please type your answer here..."
          className="w-full p-3 rounded-lg border border-blue-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      )}
    </div>
  </div>
);

export default Questionnaire;
