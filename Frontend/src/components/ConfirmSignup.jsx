import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ConfirmSignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();
  const handleConfirmation = async (formData) => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Confirmation error:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConfirmation(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-8 sm:gap-10 p-6 sm:p-10 rounded-2xl w-full max-w-md sm:max-w-lg shadow-lg"
      >
        <div className="flex flex-col items-center border-b-2 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Confirm Your Account
          </h1>
          <p className="text-sm sm:text-base mt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <label className="relative w-full my-3">
            <input
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
              type="text"
              name="code"
              value={formData.code}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="block w-full p-3 text-sm text-black bg-yellow-100 border border-white rounded-md focus:outline-none peer"
              required
            />
            <span className="absolute text-black text-lg duration-300 left-3 top-3 peer-focus:text-sm peer-focus:-translate-y-5 peer-focus:px-1 peer-valid:text-sm peer-valid:-translate-y-5 peer-valid:px-1 bg-yellow-100">
              Code
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-300 px-6 py-3 rounded-full text-white font-bold text-sm tracking-wide w-full"
        >
          CONFIRM CODE
        </button>
      </form>
    </div>
  );
};

export default ConfirmSignUp;
