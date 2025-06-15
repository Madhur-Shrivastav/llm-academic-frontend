import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    const education_level = sessionStorage.getItem("education_level");
    if (education_level) {
      // This logic might need re-evaluation depending on desired flow.
      // For now, keeping it but noting it might conflict if user explicitly navigates to login.
      // navigate("/welcome");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  console.log(formData);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (formData) => {
    try {
      console.log("Logging in data:", formData);
      const res = await fetch(`${import.meta.env.VITE_API_URL}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }
      localStorage.setItem("token", data.access_token);
      const mergedUser = {
        id: data.user_id,
        education_level: data.education_level,
        email: formData.email,
      };
      localStorage.setItem("user", JSON.stringify(mergedUser));

      // if (data.user_id) {
      //   localStorage.setItem("user_id", data.user_id);
      // } else {
      //   localStorage.removeItem("user");
      //   console.warn(
      //     "User ID from API was undefined or invalid. 'user_id' not set in localStorage."
      //   );
      // }
      localStorage.setItem("loginTime", Date.now().toString());
      navigate("/chat");

      // if (data.user_id) {
      //   try {
      //     const questionnaireRes = await fetch(
      //       `${import.meta.env.VITE_API_URL}profile/questionnaire/${
      //         data.user_id
      //       }`,
      //       {
      //         method: "GET",
      //         headers: {
      //           "Content-Type": "application/json",
      //           Authorization: `Bearer ${data.access_token}`,
      //         },
      //       }
      //     );
      //     console.log(questionnaireRes);

      //     if (questionnaireRes.ok) {
      //       // Questionnaire data exists
      //       navigate("/chat"); // Navigate to chat area
      //     } else if (questionnaireRes.status === 404) {
      //       // Questionnaire data does not exist
      //       if (data.education_level) {
      //         sessionStorage.setItem(
      //           "education_level",
      //           JSON.stringify({ education_level: data.education_level })
      //         );
      //         navigate("/profile/questionnaire");
      //       } else {
      //         navigate("/welcome");
      //       }
      //     } else {
      //       // Handle other errors from questionnaire check
      //       console.error(
      //         "Error checking questionnaire status:",
      //         await questionnaireRes.text()
      //       );
      //       // CORS or other network errors - fallback to welcome page
      //       navigate("/welcome");
      //     }
      //   } catch (qError) {
      //     console.error("Failed to fetch questionnaire status:", qError);
      //     // Handle CORS errors or network issues
      //     if (qError.message.includes("CORS") || qError.name === "TypeError") {
      //       console.warn(
      //         "CORS error detected. Redirecting to welcome page as fallback."
      //       );
      //       navigate("/welcome");
      //     } else {
      //       alert(
      //         "An error occurred while checking your profile status. Proceeding to welcome page."
      //       );
      //       navigate("/welcome");
      //     }
      //   }
      // } else {
      //   // Fallback if user_id is not available from API response
      //   console.warn(
      //     "User ID missing in API response. Navigating to default page, expecting ChatArea to redirect to login if needed."
      //   );
      //   navigate("/");
      // }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-8 sm:gap-10 p-6 sm:p-10 rounded-2xl w-full max-w-md sm:max-w-lg shadow-lg"
      >
        <div className="flex flex-col items-center border-b-2 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Log Into Your Account
          </h1>
          <p className="text-sm sm:text-base mt-2">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <label className="relative w-full my-3">
            <input
              ref={emailRef}
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none peer"
              required
            />
            <span className="absolute text-black text-lg duration-300 left-3 top-3 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1 bg-yellow-100">
              Email
            </span>
          </label>

          <label className="relative w-full my-3">
            <input
              ref={passwordRef}
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none peer"
              required
            />
            <span className="absolute text-black text-lg duration-300 left-3 top-3 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1 bg-yellow-100">
              Password
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-300 px-6 py-3 rounded-full text-white font-bold text-sm tracking-wide w-full"
        >
          LOG IN
        </button>
      </form>
    </div>
  );
};

export default Login;
