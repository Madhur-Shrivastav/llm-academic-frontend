import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    try {
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
        if (data.detail === "Invalid credentials") {
          toast.error("Invalid email or password", { autoClose: 3000 });
        } else {
          toast.error(data.detail || "Login failed", { autoClose: 3000 });
        }
        return;
      }

      toast.success("Login successful!", { autoClose: 1000 });
      localStorage.setItem("token", data.access_token);

      const mergedUser = {
        id: data.user_id,
        education_level: data.education_level,
        full_name: data.full_name,
        email: data.email,
        contact: data.contact,
        llm_profile: data.llm_profile,
      };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      localStorage.setItem("loginTime", Date.now().toString());

      setTimeout(() => {
        navigate("/chat");
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unexpected server error", { autoClose: 3000 });
    } finally {
      setLoading(false);
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
        <ToastContainer />
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
          disabled={loading}
          className={`px-6 py-3 rounded-full text-white font-bold text-sm tracking-wide w-full transition-all duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 hover:scale-105"
          }`}
        >
          {loading ? "Logging in..." : "LOG IN"}
        </button>
      </form>
    </div>
  );
};

export default Login;
