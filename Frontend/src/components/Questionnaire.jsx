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

  useEffect(() => {
    if (user_id) {
      setFormData((prev) => ({ ...prev, user_id }));
    }
  }, [user_id]);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      if (name === "academic_strengths_marks" && typeof value === "object") {
        return {
          ...prev,
          [name]: {
            ...prev[name],
            ...value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  console.log(formData);

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

  const isFormComplete = () => {
    return Object.keys(formData)
      .filter((key) => key !== "user_id")
      .every((key) => {
        const val = formData[key];
        if (
          val &&
          typeof val === "object" &&
          val.value?.toLowerCase().includes("other")
        ) {
          return val.otherText?.trim().length > 0;
        }
        return val !== "" && val !== null && val !== undefined;
      });
  };

  const flattenAnswers = (answers) => {
    const flat = {};
    for (const [key, val] of Object.entries(answers)) {
      if (
        val &&
        typeof val === "object" &&
        val.value &&
        typeof val.value === "string"
      ) {
        flat[key] =
          val.value.toLowerCase().includes("other") && val.otherText
            ? `${val.value}: ${val.otherText}`
            : val.value;
      } else {
        flat[key] = val;
      }
    }
    return flat;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      alert("Please answer all questions before proceeding.");
      return;
    }

    try {
      const { user_id, ...rawAnswers } = formData;
      const answers = flattenAnswers(rawAnswers);

      let backendEducationLevel = "graduate";
      if (educationLevel === "9th or 10th") backendEducationLevel = "10th";
      else if (educationLevel === "11th or 12th")
        backendEducationLevel = "12th";

      const questionsData = {};
      questions.forEach((question, index) => {
        const questionId = question.name || `q${index + 1}`;
        questionsData[questionId] = {
          text: question.prompt,
          options:
            question.options && Array.isArray(question.options)
              ? question.options.reduce((opts, option, optIndex) => {
                  opts[String.fromCharCode(97 + optIndex)] = option;
                  return opts;
                }, {})
              : {},
          category: question.name,
        };
      });

      answers.academic_strengths_marks = "70-80%";

      const payload = {
        user_id,
        education_level: backendEducationLevel,
        raw_responses: answers,
        questions_data: questionsData,
      };

      console.log("Sending payload:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}profile/questionnaire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem(
          "llm_profile",
          JSON.stringify(result.llm_profile)
        );
        sessionStorage.setItem("questionnaire_id", result.id);
        navigate(`/result`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert("Submission error: " + (errorData.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Submission failed", error);
      alert("An error occurred: " + error.message);
    }
  };

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
            name={name}
            selected={formData[name]}
            onSelect={(value) => handleChange(name, value)}
          />
        ))}

        <button
          className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full"
          onClick={handleSubmit}
        >
          Let's get started!
        </button>
      </div>
    </div>
  );
};

const QuestionCard = ({ title, prompt, options, selected, onSelect, name }) => {
  const isGroupedMCQ =
    options && typeof options === "object" && !Array.isArray(options);

  return (
    <div className="rounded-2xl border border-yellow-100 bg-yellow-100 p-5 shadow">
      <h2 className="text-lg font-semibold text-blue-800 mb-2">{title}</h2>
      <p className="text-gray-800 font-medium mb-4">{prompt}</p>

      {isGroupedMCQ ? (
        <div className="space-y-4">
          {Object.entries(options).map(([subject, subjectOptions]) => (
            <div key={subject}>
              <label className="block font-semibold mb-2">{subject}:</label>
              <div className="flex flex-wrap gap-3">
                {subjectOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSelect({ [subject]: opt })}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selected?.[subject] === opt
                        ? "bg-blue-600 text-white"
                        : "border border-blue-500 text-blue-600 hover:scale-105"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Array.isArray(options) ? (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <div key={option} className="flex flex-col">
              <button
                type="button"
                onClick={() => onSelect(option)} // sets "Other"
                className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  selected === option ||
                  (option.toLowerCase().includes("other") &&
                    selected &&
                    !options.includes(selected))
                    ? "bg-blue-600 text-white"
                    : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                {option}
              </button>

              {option.toLowerCase().includes("other") &&
                (selected === option || !options.includes(selected)) && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={options.includes(selected) ? "" : selected || ""}
                    onChange={(e) => onSelect(e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                )}
            </div>
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
  );
};

export default Questionnaire;
