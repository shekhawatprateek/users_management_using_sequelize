import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import Loader from "../components/Loader";

const Profile = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser?.name,
      email: currentUser?.email,
    },
  });

  const file = watch("profileImage");
  const imagePreviewUrl =
    file && file.length > 0 ? URL.createObjectURL(file[0]) : null;

  async function submitHandler(data) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);

      if (data.profileImage && data.profileImage.length > 0) {
        formData.append("profileImage", data.profileImage[0]);
      }

      // Hit the PUT route
      const response = await api.put(
        "http://localhost:8000/v1/user/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUserData(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      reset();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-96 border-2 border-black">
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>

        {!isEditing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{userData?.name}</p>
              <p className="text-gray-600">{userData?.email}</p>
              <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase">
                {userData?.role}
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-black w-full"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit(submitHandler)}
          >
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-full mx-auto"
              />
            )}

            <label className="text-sm font-semibold">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="border-2 border-gray-300 rounded p-2"
              type="text"
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}

            <label className="text-sm font-semibold">Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              className="border-2 border-gray-300 rounded p-2"
              type="email"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}

            <label className="text-sm font-semibold">
              New Profile Image (Optional)
            </label>
            <input
              {...register("profileImage")}
              className="border-2 border-gray-300 rounded p-1"
              type="file"
              accept="image/*"
            />

            <div className="flex gap-2 mt-4">
              <button
                disabled={isLoading}
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-1 font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Processing...
                  </>
                ) : (
                  "Save"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex-1 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
