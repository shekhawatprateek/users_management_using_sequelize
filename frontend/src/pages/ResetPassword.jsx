import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useState } from "react";

const ResetPassword = () => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm();
  const { id, token } = useParams(); // Grabs the data from the URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  

  async function submitHandler(data) {
    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:8000/v1/user/reset-password/${id}/${token}`, data);
      
      alert(response.data.message);
      reset();
      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset password.");
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen border-2 border-black">
      <h1 className="bg-blue-400 p-2 text-white font-bold mb-4">Create New Password</h1>

      <form className="flex flex-col gap-3 w-72" onSubmit={handleSubmit(submitHandler)}>
        <input
          {...register("newPassword", { 
            required: "New Password is required",
            minLength: { value: 6, message: "Must be at least 6 characters" }
          })}
          className="border-2 border-gray-300 rounded p-2"
          type="password"
          placeholder="Enter new password"
        />
        {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword.message}</span>}

        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-2 font-bold" type="submit">
          {isLoading ? (
            <>
              <Loader />
              Processing...
            </>
          ) : (
            "Save New Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;