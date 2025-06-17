// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   senior_secondary_questions,
//   tenth_grade_questions,
//   graduate_questions,
// } from "../assets/Questions";

// const Questionnaire = () => {
//   const [questions, setQuestions] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [educationLevel, setEducationLevel] = useState(null);
//   const [user_id, setUserId] = useState(null);

//   useEffect(() => {
//     // Simulated user (for demo/testing)
//     setEducationLevel("graduate");
//     setUserId("test_user_123");
//   }, []);

//   useEffect(() => {
//     if (user_id) {
//       setFormData((prev) => ({ ...prev, user_id }));
//     }
//   }, [user_id]);

//   useEffect(() => {
//     if (!educationLevel) return;

//     let selectedQuestions = [];
//     if (educationLevel === "9th or 10th") {
//       selectedQuestions = tenth_grade_questions;
//     } else if (educationLevel === "11th or 12th") {
//       selectedQuestions = senior_secondary_questions;
//     } else {
//       selectedQuestions = graduate_questions;
//     }

//     setQuestions(selectedQuestions);

//     setFormData((prev) => {
//       const initData = {};
//       selectedQuestions.forEach((q) => {
//         initData[q.name] = "";
//       });
//       return { ...prev, ...initData };
//     });
//   }, [educationLevel]);

//   const handleChange = (name, value) => {
//     setFormData((prev) => {
//       if (name === "academic_strengths_marks" && typeof value === "object") {
//         return {
//           ...prev,
//           [name]: {
//             ...prev[name],
//             ...value,
//           },
//         };
//       }

//       return {
//         ...prev,
//         [name]: value,
//       };
//     });
//   };

//   console.log(formData)
//   const isFormComplete = () => {
//     return Object.keys(formData)
//       .filter((key) => key !== "user_id")
//       .every((key) => {
//         const val = formData[key];
//         if (
//           val &&
//           typeof val === "object" &&
//           val.value?.toLowerCase().includes("other")
//         ) {
//           return val.otherText?.trim().length > 0;
//         }
//         return val !== "" && val !== null && val !== undefined;
//       });
//   };

//   const flattenAnswers = (answers) => {
//     const flat = {};

//     for (const [key, val] of Object.entries(answers)) {
//       if (Array.isArray(val)) {
//         // Array of strings or objects
//         flat[key] = val
//           .map((item) => {
//             if (typeof item === "object" && item?.value) {
//               return item.value.toLowerCase().includes("other") && item.otherText
//                 ? `${item.value}: ${item.otherText}`
//                 : item.value;
//             }
//             return item;
//           })
//           .join(", ");
//       } else if (
//         val &&
//         typeof val === "object" &&
//         val.value &&
//         typeof val.value === "string"
//       ) {
//         // Single selection with optional "Other"
//         flat[key] =
//           val.value.toLowerCase().includes("other") && val.otherText
//             ? `${val.value}: ${val.otherText}`
//             : val.value;
//       } else if (val && typeof val === "object") {
//         // Grouped selections like academic_strengths_marks
//         flat[key] = Object.entries(val)
//           .map(([sub, mark]) => `${sub}: ${mark}`)
//           .join(", ");
//       } else {
//         // Simple string or value
//         flat[key] = val;
//       }
//     }

//     return flat;
//   };

//   const handleSubmit = async () => {
//     if (!isFormComplete()) {
//       alert("Please answer all questions before proceeding.");
//       return;
//     }

//     try {
//       const { user_id, ...rawAnswers } = formData;
//       const answers = flattenAnswers(rawAnswers);

//       let backendEducationLevel = "graduate";
//       if (educationLevel === "9th or 10th") backendEducationLevel = "10th";
//       else if (educationLevel === "11th or 12th")
//         backendEducationLevel = "12th";

//       const questionsData = {};
//       questions.forEach((question, index) => {
//         const questionId = question.name || `q${index + 1}`;
//         questionsData[questionId] = {
//           text: question.prompt,
//           options:
//             question.options && Array.isArray(question.options)
//               ? question.options.reduce((opts, option, optIndex) => {
//                 opts[String.fromCharCode(97 + optIndex)] = option;
//                 return opts;
//               }, {})
//               : {},
//           category: question.name,
//         };
//       });

//       // answers.academic_strengths_marks = answers.academic_strengths_marks || "70-80%";

//       const payload = {
//         user_id,
//         education_level: backendEducationLevel,
//         raw_responses: answers,
//         questions_data: questionsData,
//       };

//       console.log("Sending payload:", payload);
//     } catch (error) {
//       console.error("Submission failed", error);
//       alert("An error occurred: " + error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-white flex flex-col items-center py-10 px-4 sm:px-8 font-poppins">
//       <div className="flex flex-col items-center">
//         <img
//           src="/logo.jpg"
//           alt="TrueYou Careers"
//           className="h-[18rem] sm:h-[20rem] "
//         />
//       </div>

//       <div className="w-full max-w-3xl space-y-6">
//         {questions.map(({ title, prompt, options, name }) => {
//           if (
//             (name === "reason_for_misalignment_multiple" &&
//             formData["stream_alignment"] !==
//             "❌ No — I feel off-track or unsure") ||
//             (name === "unsure_reason_multiple" &&
//             formData["confidence_stream_choice"] !==
//             "❌ No, I feel unsure or confused")
//           ) {
//             return null;
//           }

//           return (
//             <QuestionCard
//               key={name}
//               title={title}
//               prompt={prompt}
//               options={options}
//               name={name}
//               selected={formData[name]}
//               onSelect={(value) => handleChange(name, value)}
//             />
//           );
//         })}

//         <button
//           className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full"
//           onClick={handleSubmit}
//         >
//           Let's get started!
//         </button>
//       </div>
//     </div>
//   );
// }

// const QuestionCard = ({ title, prompt, options, selected, onSelect, name }) => {
//   const isGroupedMCQ = options && typeof options === "object" && !Array.isArray(options);
//   const isMultiSelect = name.toLowerCase().includes("multiple");
//   const isOpenEnded = !options;

//   const handleMultiSelect = (option) => {
//     let updated = Array.isArray(selected) ? [...selected] : [];

//     const existingIndex = updated.findIndex((item) => {
//       if (typeof item === "string") return item === option;
//       if (typeof item === "object") return item?.value === option;
//       return false;
//     });

//     if (existingIndex > -1) {
//       updated.splice(existingIndex, 1); // Deselect
//     } else {
//       if (option.toLowerCase().includes("other")) {
//         updated.push({ value: option, otherText: "" }); // push as object
//       } else {
//         updated.push(option);
//       }
//     }

//     onSelect(updated);
//   };

//   return (
//     <div className="rounded-2xl border border-yellow-100 bg-yellow-100 p-5 shadow ">
//       <h2 className="text-lg font-semibold text-blue-800 mb-2">{title}</h2>
//       <p className="text-gray-800 font-medium mb-4">{prompt}</p>

//       {isGroupedMCQ ? (
//         <div className="space-y-4">
//           {Object.entries(options).map(([subject, subjectOptions]) => (
//             <div key={subject}>
//               <label className="block font-semibold mb-2">{subject}:</label>
//               <div className="flex flex-wrap gap-3">
//                 {subjectOptions.map((opt) => (
//                   <button
//                     key={opt}
//                     type="button"
//                     onClick={() => onSelect({ ...selected, [subject]: opt })}
//                     className={`px-3 py-1 rounded-full text-left text-sm font-medium transition-all ${selected?.[subject] === opt
//                       ? "bg-blue-600 text-white"
//                       : "border border-blue-500 text-blue-600 hover:scale-105"
//                       }`}
//                   >
//                     {opt}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : isMultiSelect ? (
//         // <div className="flex flex-wrap gap-3">
//         //   {options.map((opt) => (
//         //     <button
//         //       key={opt}
//         //       type="button"
//         //       onClick={() => handleMultiSelect(opt)}
//         //       className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${Array.isArray(selected) && selected.includes(opt)
//         //         ? "bg-blue-600 text-white"
//         //         : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
//         //         }`}
//         //     >
//         //       {opt}
//         //     </button>
//         //   ))}

//         // </div>

//         <div className="flex flex-col gap-3">
//           <div className="flex flex-wrap gap-3">
//             {options.map((opt) => (
//               <button
//                 key={opt}
//                 type="button"
//                 onClick={() => handleMultiSelect(opt)}
//                 className={`px-4 py-2 rounded-lg font-semibold text-sm text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${Array.isArray(selected) && selected.includes(opt)
//                   ? "bg-blue-600 text-white"
//                   : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
//                   }`}
//               >
//                 {opt}
//               </button>
//             ))}
//           </div>

//           {/* 👇 Add this block for rendering text input when 'Other' is selected */}
//           {Array.isArray(selected) &&
//             selected.some(
//               (s) => typeof s === "object" && s.value?.toLowerCase().includes("other")
//             ) && (
//               <input
//                 type="text"
//                 placeholder="Please specify..."
//                 value={
//                   selected.find(
//                     (s) => typeof s === "object" && s.value?.toLowerCase().includes("other")
//                   )?.otherText || ""
//                 }
//                 onChange={(e) => {
//                   const updated = selected.map((item) => {
//                     if (
//                       typeof item === "object" &&
//                       item.value?.toLowerCase().includes("other")
//                     ) {
//                       return { ...item, otherText: e.target.value };
//                     }
//                     return item;
//                   });
//                   onSelect(updated);
//                 }}
//                 className="mt-2 p-2 border border-gray-300 rounded-md"
//               />
//             )}
//         </div>

//       ) : Array.isArray(options) ? (
//         <div className="flex flex-wrap gap-3">
//           {options.map((option) => (
//             <div key={option} className="flex flex-col">
//               <button
//                 type="button"
//                 onClick={() => onSelect(option)}
//                 className={`px-4 py-2 rounded-lg font-semibold text-sm text-left sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${selected === option ||
//                   (option.toLowerCase().includes("other") &&
//                     selected &&
//                     !options.includes(selected))
//                   ? "bg-blue-600 text-white"
//                   : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
//                   }`}
//               >
//                 {option}
//               </button>

//               {option.toLowerCase().includes("other") &&
//                 (selected === option || !options.includes(selected)) && (
//                   <input
//                     type="text"
//                     placeholder="Please specify..."
//                     value={options.includes(selected) ? "" : selected || ""}
//                     onChange={(e) => onSelect(e.target.value)}
//                     className="mt-2 p-2 border border-gray-300 rounded-md"
//                   />
//                 )}
//             </div>
//           ))}
//         </div>
//       ) : isOpenEnded ? (
//         <textarea
//           value={selected || ""}
//           onChange={(e) => onSelect(e.target.value)}
//           rows={4}
//           placeholder="Please type your answer here..."
//           className="w-full p-3 rounded-lg border border-blue-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
//         />
//       ) : null}
//     </div>
//   );
// };

// export default Questionnaire;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  senior_secondary_questions,
  tenth_grade_questions,
  graduate_questions,
} from "../assets/Questions";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [educationLevel, setEducationLevel] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // console.log(formData)
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
      if (Array.isArray(val)) {
        // Array of strings or objects
        flat[key] = val
          .map((item) => {
            if (typeof item === "object" && item?.value) {
              return item.value.toLowerCase().includes("other") &&
                item.otherText
                ? `${item.value}: ${item.otherText}`
                : item.value;
            }
            return item;
          })
          .join(", ");
      } else if (
        val &&
        typeof val === "object" &&
        val.value &&
        typeof val.value === "string"
      ) {
        // Single selection with optional "Other"
        flat[key] =
          val.value.toLowerCase().includes("other") && val.otherText
            ? `${val.value}: ${val.otherText}`
            : val.value;
      } else if (val && typeof val === "object") {
        // Grouped selections like academic_strengths_marks
        flat[key] = Object.entries(val)
          .map(([sub, mark]) => `${sub}: ${mark}`)
          .join(", ");
      } else {
        // Simple string or value
        flat[key] = val;
      }
    }

    return flat;
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      toast.warning("Please answer all questions before proceeding.", {
        autoClose: 2000,
      });
      return;
    }
    setLoading(true);

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

      // answers.academic_strengths_marks = answers.academic_strengths_marks || "70-80%";

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

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center py-10 px-4 sm:px-8 font-poppins">
      <div className="flex flex-col items-center">
        <img
          src="/logo.jpg"
          alt="TrueYou Careers"
          className="h-[18rem] sm:h-[20rem] "
        />
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {questions.map(({ title, prompt, options, name }) => {
          if (
            (name === "reason_for_misalignment_multiple" &&
              formData["stream_alignment"] !==
                "❌ No — I feel off-track or unsure") ||
            (name === "unsure_reason_multiple" &&
              formData["confidence_stream_choice"] !==
                "❌ No, I feel unsure or confused")
          ) {
            return null;
          }

          return (
            <QuestionCard
              key={name}
              title={title}
              prompt={prompt}
              options={options}
              name={name}
              selected={formData[name]}
              onSelect={(value) => handleChange(name, value)}
            />
          );
        })}

        <button
          className={` hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full ${
            loading ? "bg-yellow-400" : "bg-yellow-500"
          }`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analyzing Answer" : "Let's get started!"}
        </button>
      </div>
    </div>
  );
};

const QuestionCard = ({ title, prompt, options, selected, onSelect, name }) => {
  const isGroupedMCQ =
    options && typeof options === "object" && !Array.isArray(options);
  const isMultiSelect = name.toLowerCase().includes("multiple");
  const isOpenEnded = !options;

  const handleMultiSelect = (option) => {
    let updated = Array.isArray(selected) ? [...selected] : [];

    const existingIndex = updated.findIndex((item) => {
      if (typeof item === "string") return item === option;
      if (typeof item === "object") return item?.value === option;
      return false;
    });

    if (existingIndex > -1) {
      updated.splice(existingIndex, 1); // Deselect
    } else {
      if (option.toLowerCase().includes("other")) {
        updated.push({ value: option, otherText: "" }); // push as object
      } else {
        updated.push(option);
      }
    }

    onSelect(updated);
  };

  return (
    <div className="rounded-2xl border border-yellow-100 bg-yellow-100 p-5 shadow ">
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
                    onClick={() => onSelect({ ...selected, [subject]: opt })}
                    className={`px-3 py-1 rounded-full text-left text-sm font-medium transition-all ${
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
      ) : isMultiSelect ? (
        // <div className="flex flex-wrap gap-3">
        //   {options.map((opt) => (
        //     <button
        //       key={opt}
        //       type="button"
        //       onClick={() => handleMultiSelect(opt)}
        //       className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${Array.isArray(selected) && selected.includes(opt)
        //         ? "bg-blue-600 text-white"
        //         : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
        //         }`}
        //     >
        //       {opt}
        //     </button>
        //   ))}

        // </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleMultiSelect(opt)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  Array.isArray(selected) && selected.includes(opt)
                    ? "bg-blue-600 text-white"
                    : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* 👇 Add this block for rendering text input when 'Other' is selected */}
          {Array.isArray(selected) &&
            selected.some(
              (s) =>
                typeof s === "object" &&
                s.value?.toLowerCase().includes("other")
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
        </div>
      ) : Array.isArray(options) ? (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <div key={option} className="flex flex-col">
              <button
                type="button"
                onClick={() => onSelect(option)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm text-left sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
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
      ) : isOpenEnded ? (
        <textarea
          value={selected || ""}
          onChange={(e) => onSelect(e.target.value)}
          rows={4}
          placeholder="Please type your answer here..."
          className="w-full p-3 rounded-lg border border-blue-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      ) : null}
    </div>
  );
};

export default Questionnaire;
