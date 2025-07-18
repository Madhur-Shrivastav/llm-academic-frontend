import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Questionnaire = () => {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!educationLevel) return;

    setLoading(true);

    let levelToFetch = "";
    if (educationLevel === "9th or 10th") {
      levelToFetch = "10th";
    } else if (educationLevel === "11th or 12th") {
      levelToFetch = "12th";
    } else {
      levelToFetch = "graduate";
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}questions/${levelToFetch}`
        );
        const data = await response.json();

        setQuestions(data);

        const initData = {};
        data.forEach((q) => {
          if (q.type === "multi") initData[q.name] = [];
          else if (q.type === "grouped") initData[q.name] = {};
          else initData[q.name] = "";
        });

        setFormData((prev) => ({ ...prev, ...initData }));
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        toast.error("Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [educationLevel]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormComplete = () => {
    return questions.every((q) => {
      if (q.depends_on) {
        if (formData[q.depends_on.name] !== q.depends_on.value) return true;
      }

      const val = formData[q.name];

      if (q.type === "text") {
        return typeof val === "string" && val.trim() !== "";
      }

      if (q.type === "single") {
        if (!val) return false;
        if (typeof val === "string") return val.trim() !== "";
        if (typeof val === "object" && val.value) {
          if (val.value.toLowerCase().includes("other")) {
            return val.otherText && val.otherText.trim() !== "";
          }
          return true;
        }
        return false;
      }

      if (q.type === "multi") {
        if (!Array.isArray(val) || val.length === 0) return false;

        return val.every((item) => {
          if (typeof item === "string") return true;
          if (
            typeof item === "object" &&
            item.value &&
            item.value.toLowerCase().includes("other")
          ) {
            return item.otherText && item.otherText.trim() !== "";
          }
          return true;
        });
      }

      if (q.type === "grouped") {
        if (!val || typeof val !== "object") return false;
        const groupKeys = Object.keys(q.grouped_options || {});
        return groupKeys.every(
          (group) => val[group] && val[group].trim() !== ""
        );
      }

      return val !== "" && val !== null && val !== undefined;
    });
  };

  const flattenAnswers = (answers) => {
    const flat = {};

    for (const [key, val] of Object.entries(answers)) {
      if (Array.isArray(val)) {
        flat[key] = val
          .map((item) =>
            typeof item === "object" && item.value
              ? `${item.value}${item.otherText ? ` (${item.otherText})` : ""}`
              : item
          )
          .join(", ");
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        flat[key] = Object.entries(val)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      } else {
        flat[key] = val;
      }
    }

    return flat;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      toast.error("Please answer all questions before proceeding.", {
        autoClose: 2000,
      });
      alert("Please answer all questions before proceeding.");
      return;
    }

    try {
      const { user_id, ...rawAnswers } = formData;
      const answers = flattenAnswers(rawAnswers);

      const questionsData = {};
      questions.forEach((q) => {
        questionsData[q.name] = {
          text: q.prompt,
          options: Array.isArray(q.options)
            ? q.options.reduce((acc, opt, i) => {
                acc[String.fromCharCode(97 + i)] = opt;
                return acc;
              }, {})
            : {},
          category: q.name,
        };
      });

      let backendEducationLevel = "graduate";
      if (educationLevel === "9th or 10th") backendEducationLevel = "10th";
      else if (educationLevel === "11th or 12th")
        backendEducationLevel = "12th";

      const payload = {
        user_id,
        education_level: backendEducationLevel,
        raw_responses: answers,
        questions_data: questionsData,
      };

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
        toast.success("All answers submitted!", { autoClose: 2000 });
        navigate(`/result`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          "Submission error: " + (errorData.detail || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("An error occurred: " + error.message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-lg">Loading questions...</div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center py-10 px-4 sm:px-8 font-poppins">
      <div className="flex flex-col items-center">
        <img src="/logo.jpg" alt="Logo" className="h-[18rem] sm:h-[20rem]" />
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {questions.map((q) => {
          const shouldRender =
            !q.depends_on || formData[q.depends_on.name] === q.depends_on.value;

          if (!shouldRender) return null;

          return (
            <QuestionCard
              key={q._id}
              {...q}
              selected={formData[q.name]}
              onSelect={(val) => handleChange(q.name, val)}
            />
          );
        })}

        <button
          className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analysing..." : "Let's get started!"}
        </button>
      </div>
    </div>
  );
};

const QuestionCard = ({
  title,
  prompt,
  type,
  options,
  grouped_options,
  selected,
  onSelect,
  name,
}) => {
  const isMulti = type === "multi";
  const isGrouped = type === "grouped";
  const isText = type === "text";

  return (
    <div className="rounded-2xl border border-yellow-100 bg-yellow-100 p-5 shadow">
      <h2 className="text-[24px] font-semibold text-blue-800 mb-2">{title}</h2>
      <p className="text-gray-800 font-medium mb-4 text-2xl">{prompt}</p>

      {isGrouped && grouped_options && (
        <div className="space-y-4">
          {Object.entries(grouped_options).map(([group, opts]) => (
            <div key={group}>
              <label className="block font-semibold mb-2">{group}:</label>
              <div className="flex flex-wrap gap-3">
                {opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onSelect({ ...selected, [group]: opt })}
                    className={`px-3 py-1 rounded-full text-xl font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      selected?.[group] === opt
                        ? "bg-blue-600 text-white"
                        : "border border-blue-500 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isMulti && Array.isArray(options) && (
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => {
            const isSelected = selected?.some((item) =>
              typeof item === "object" ? item.value === opt : item === opt
            );

            return (
              <button
                key={opt}
                onClick={() => {
                  const isOther = opt.toLowerCase().includes("other");
                  const updated =
                    selected?.filter((item) =>
                      typeof item === "object"
                        ? item.value !== opt
                        : item !== opt
                    ) || [];

                  if (!isSelected) {
                    updated.push(isOther ? { value: opt, otherText: "" } : opt);
                  }

                  onSelect(updated);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-[18px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "border border-blue-500 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {isMulti &&
        Array.isArray(selected) &&
        selected.some(
          (s) =>
            typeof s === "object" && s.value?.toLowerCase().includes("other")
        ) && (
          <input
            type="text"
            placeholder="Please specify..."
            value={
              selected.find(
                (s) =>
                  typeof s === "object" &&
                  s.value?.toLowerCase().includes("other")
              )?.otherText || ""
            }
            onChange={(e) => {
              const updated = selected.map((item) => {
                if (
                  typeof item === "object" &&
                  item.value?.toLowerCase().includes("other")
                ) {
                  return { ...item, otherText: e.target.value };
                }
                return item;
              });
              onSelect(updated);
            }}
            className="mt-2 p-2 border border-gray-300 rounded-md"
          />
        )}

      {type === "single" && Array.isArray(options) && (
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() =>
                opt.toLowerCase().includes("other")
                  ? onSelect({ value: opt, otherText: "" })
                  : onSelect(opt)
              }
              className={`px-4 py-2 rounded-lg font-semibold text-[18px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                (typeof selected === "object" ? selected?.value : selected) ===
                opt
                  ? "bg-blue-600 text-white"
                  : "border border-blue-500 text-blue-600 hover:bg-blue-100"
              } text-left`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {type === "single" &&
        typeof selected === "object" &&
        selected.value?.toLowerCase().includes("other") && (
          <input
            type="text"
            placeholder="Please specify..."
            value={selected.otherText || ""}
            onChange={(e) =>
              onSelect({ ...selected, otherText: e.target.value })
            }
            className="mt-2 p-2 border border-gray-300 rounded-md"
          />
        )}

      {isText && (
        <textarea
          rows={4}
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mt-2"
          placeholder="Type your answer here..."
        />
      )}
    </div>
  );
};

export default Questionnaire;
