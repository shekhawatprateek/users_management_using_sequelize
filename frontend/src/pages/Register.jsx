import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import Loader from "../components/Loader";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const file = watch("profileImage");

  const imagePreviewUrl =
    file && file.length > 0 ? URL.createObjectURL(file[0]) : null;

  async function submitHandler(data) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", data.role);

      if (data.profileImage && data.profileImage.length > 0) {
        formData.append("profileImage", data.profileImage[0]);
      }

      const response = await axios.post(
        "http://localhost:8000/v1/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      reset();
      console.log("Registration Success:", response.data);
    } catch (error) {
      console.log(
        "Registration Failed:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen border-2 border-black">
      <h1 className="bg-blue-400 p-2 text-white font-bold mb-4">Register</h1>

      {/* The Instant Image Preview */}
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Profile Preview"
          className="w-24 h-24 object-cover rounded-full border-2 border-gray-400 mb-4"
        />
      )}

      <form
        className="flex flex-col gap-3 w-72"
        onSubmit={handleSubmit(submitHandler)}
      >
        {/* Name */}
        <input
          {...register("name", { required: "Name is required" })}
          className="border-2 border-gray-300 rounded p-2"
          type="text"
          placeholder="Enter your name"
        />
        {errors.name && (
          <span className="text-xs text-red-500">{errors.name.message}</span>
        )}

        {/* Email */}
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="border-2 border-gray-300 rounded p-2"
          type="email"
          placeholder="Enter your email"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}

        {/* Password */}
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className="border-2 border-gray-300 rounded p-2"
          type="password"
          placeholder="Enter your password"
        />
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}

        {/* Role */}
        <select
          {...register("role")}
          className="border-2 border-gray-300 rounded p-2 bg-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Profile Image */}
        <input
          {...register("profileImage")}
          className="border-2 border-gray-300 rounded p-1"
          type="file"
          accept="image/*" // This ensures the file picker only shows images
        />
        {errors.profileImage && (
          <span className="text-xs text-red-500">
            {errors.profileImage.message}
          </span>
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
            "Register"
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;
