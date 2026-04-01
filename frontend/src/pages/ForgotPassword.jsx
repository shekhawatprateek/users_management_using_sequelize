import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";


const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  async function submitHandler(data) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/v1/user/forgot-password",
        data,
      );
      setMessage({ type: "success", text: response.data.message });
      reset()
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen border-2 border-black">
      <h1 className="bg-blue-400 p-2 text-white font-bold mb-4">
        Forgot Password
      </h1>

      {message && (
        <div
          className={`p-2 mb-4 text-white text-sm rounded w-72 text-center ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {message.text}
        </div>
      )}

      <form
        className="flex flex-col gap-3 w-72"
        onSubmit={handleSubmit(submitHandler)}
      >
        <input
          {...register("email", { required: "Email is required" })}
          className="border-2 border-gray-300 rounded p-2"
          type="email"
          placeholder="Enter your registered email"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}

        <button
        disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-2 font-bold"
          type="submit"
        >
           {isLoading ? (
            <>
              <Loader />
              Processing...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        {/* ADD THIS NEW LINK BLOCK */}
        <div className="text-center mt-2">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Remember your password? Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
