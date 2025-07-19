import { use, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [grade2,setGrade2] = useState("");
  const options = [
    { label: "9th", value: "9th or 10th" },
    { label: "10th", value: "9th or 10th" },
    { label: "11th", value: "11th or 12th" },
    { label: "12th", value: "11th or 12th" },
    { label: "Graduation", value: "Graduation" }
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    grade: grade,
    password: "",
    //profileImage: null,
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSignUp = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.first_name + " " + formData.last_name,
          email: formData.email,
          password: formData.password,
          education_level: formData.grade,
          contact: formData.contact,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail === "Email already registered") {
          toast.error("Email already registered. Please log in instead.", {
            autoClose: 3000,
          });
        } else {
          toast.error(data.detail || "Signup failed", { autoClose: 3000 });
        }
        return;
      }

      toast.success("Signup successful!", { autoClose: 2000 });

      localStorage.setItem("user", JSON.stringify(data));
      sessionStorage.setItem(
        "education_level",
        JSON.stringify(data.education_level)
      );

      setTimeout(() => {
        navigate("/welcome");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network or server error", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(formData);
    handleSignUp(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-8 rounded-2xl w-full max-w-3xl p-6 sm:p-10 shadow-xl border-4 border-blue-600"
      >
        <ToastContainer />
        <div className="flex flex-col items-center text-center">
          <img
            src="/public/logo3.jpg"
            alt="Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain mb-2"
          />
          <h1 className="text-blue-600 text-3xl sm:text-4xl font-bold mb-2">
            Sign Up
          </h1>
          <p className="text-sm sm:text-base">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Email", name: "email", type: "email" },
            { label: "Contact No.", name: "contact" },
          ].map(({ label, name, type = "text" }) => (
            <label key={name} className="relative w-full">
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                className="peer block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none"
                required
              />
              <span className="absolute left-3 top-3 bg-yellow-100 text-lg text-[#ffa500] transition-all duration-300 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1">
                {label}
              </span>
            </label>
          ))}
        </div>

        <label className="relative w-full">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="peer block w-full p-3 text-sm text-[black] bg-yellow-100 border border-white rounded-md focus:outline-none"
            required
          />
          <span className="absolute left-3 top-3 bg-yellow-100 text-lg text-[#ffa500] transition-all duration-300 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1">
            Create Password
          </span>
        </label>

        <div className="w-full">
          <p className="text-lg font-medium mb-2">What do you study?</p>
          <div className="flex flex-wrap gap-3">
            {options.map(({label,value}) => (
              <button
                type="button"
                key={label}
                onClick={() => {
                  setGrade(value);
                  setGrade2(label)
                  setFormData((prevData) => ({ ...prevData, grade: value }));
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${grade2 === label
                  ? "bg-blue-600 text-white"
                  : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`p-3 rounded-full text-white font-bold text-base transition-transform w-full ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600 hover:scale-105"
            }`}
        >
          {loading ? "Signing up..." : "SIGN UP"}
        </button>

        <p className="text-center text-sm">
          Make sure to{" "}
          <Link
            to="/confirm"
            className="text-blue-600 font-medium hover:underline"
          >
            Confirm Sign Up
          </Link>{" "}
          before logging in.
        </p>
      </form>
    </div>
  );
};

export default SignUp;
