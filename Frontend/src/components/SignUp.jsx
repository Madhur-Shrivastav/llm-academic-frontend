import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [grade, setGrade] = useState("");

  const options = ["9th or 10th", "11th or 12th", "Graduation"];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    grade: grade,
    password: "",
    profileImage: null,
  });

  console.log(formData);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const navigate = useNavigate();
  const handleSignUp = async (formData) => {
    console.log("Signing up with data:", formData);
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
        throw new Error(data.detail || "Login failed");
      }
      console.log(data);
      localStorage.setItem("user", JSON.stringify(data));
      sessionStorage.setItem(
        "education_level",
        JSON.stringify(data.education_level)
      );
      console.log(data);
      navigate("/welcome");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSignUp(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-8 rounded-2xl w-full max-w-3xl p-6 sm:p-10 shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src="/public/logo.jpg"
            alt="Logo"
            className="w-24 h-24 object-contain mb-2"
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
            { label: "First Name", name: "first_name", type: "text" },
            { label: "Last Name", name: "last_name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Contact No.", name: "contact", type: "text" },
          ].map(({ label, name, type }) => (
            <label key={name} className="relative w-full">
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={(e) => handleChange(name, e.target.value)}
                className="peer block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none"
                required
              />
              <span className="absolute left-3 top-3 bg-yellow-100 text-lg text-black transition-all duration-300 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1">
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
            className="peer block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none"
            required
          />
          <span className="absolute left-3 top-3 bg-yellow-100 text-lg text-black transition-all duration-300 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1">
            Create Password
          </span>
        </label>

        <div className="w-full">
          <p className="text-lg font-medium mb-2">What do you study?</p>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setGrade(option);
                  setFormData((prevData) => ({ ...prevData, grade: option }));
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  grade === option
                    ? "bg-blue-600 text-white"
                    : "border border-blue-500 text-blue-500 hover:scale-105 hover:border-blue-600 hover:text-blue-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 flex flex-col items-start gap-2">
          <label
            htmlFor="file"
            className="text-black font-medium cursor-pointer"
          >
            Choose a picture
          </label>
          <input
            type="file"
            id="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {formData.profileImage && (
            <img
              src={formData.profileImage}
              alt="Profile Preview"
              className="w-24 h-24 object-cover rounded-full mt-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full text-white font-bold text-base transition-transform hover:scale-105 w-full"
        >
          SIGN UP
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
