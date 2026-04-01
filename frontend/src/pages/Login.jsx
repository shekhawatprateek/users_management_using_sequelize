import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom"; // Assuming you use react-router
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [urlMessage, setUrlMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("verified") === "true") {
      setUrlMessage({
        type: "success",
        text: "Email verified successfully! Please log in.",
      });
    } else if (urlParams.get("error")) {
      setUrlMessage({
        type: "error",
        text: `Verification failed: ${urlParams.get("error")}`,
      });
    } else if (urlParams.get("message") === "AlreadyVerified") {
      setUrlMessage({
        type: "success",
        text: "Your account is already verified. Log in below.",
      });
    }
  }, [location]);

  async function submitHandler(data) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/v1/user/login",
        data,
      );

      console.log("Login Success:", response.data);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      reset();

      navigate("/dashboard"); 
    } catch (error) {
      console.log("Login Failed:", error);

      const backendError = error.response?.data?.message;

      if (Array.isArray(backendError)) {
        alert(backendError[0].msg);
      } else {
        alert(backendError || "Something went wrong during login.");
      }
    }finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen border-2 border-black">
      <h1 className="bg-blue-400 p-2 text-white font-bold mb-4">Login</h1>

      {urlMessage && (
        <div
          className={`p-2 mb-4 text-white text-sm rounded w-72 text-center ${urlMessage.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {urlMessage.text}
        </div>
      )}

      <form
        className="flex flex-col gap-3 w-72"
        onSubmit={handleSubmit(submitHandler)}
      >
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email",
            },
          })}
          className="border-2 border-gray-300 rounded p-2"
          type="email"
          placeholder="Enter your email"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}

        <input
          {...register("password", { required: "Password is required" })}
          className="border-2 border-gray-300 rounded p-2"
          type="password"
          placeholder="Enter your password"
        />
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}

        {/* ADD THIS NEW LINK BLOCK */}
        <div className="text-right w-full">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-700 font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

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
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
