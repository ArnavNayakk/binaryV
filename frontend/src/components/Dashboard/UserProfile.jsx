import React, { useState } from "react";
import { updateProfile } from "../../services/userServices";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { setWithExpiry } from "../../helper/storageWithExpiry";
import { ASSET_BASE_URL } from "../../config/api";

const resolveUserImage = (image) => {
  if (!image) return "https://placehold.co/176x176?text=User";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/")) return `${ASSET_BASE_URL}${image}`;
  return image;
};

const UserProfile = ({ isEditing, setIsEditing, isLoading, setIsLoading }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", image: null });

  const handleOnChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      if (files[0].size > 8 * 1024 * 1024) {
        toast.error("Profile image must be 8 MB or smaller");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      if (formData.image) formPayload.append("image", formData.image);

      const res = await updateProfile(formPayload);
      setUser(res.user);
      setWithExpiry("user", res.user, 24 * 60 * 60 * 1000);
      toast.success(res?.message);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Update Profile failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        // File inputs cannot be prefilled; keep current image for preview only.
        image: null,
      });
    }
  }, [user]);
  return (
    <div className="col-span-3 lg:col-span-1 bg-gray-800 max-h-300 p-6 rounded-xl shadow-sm border w-full">
      <div className="flex flex-row lg:flex-col gap-4">
        {/* Avatar + Status */}
        <div className="flex flex-col items-center">
          <img
            src={resolveUserImage(user?.image)}
            alt="profile"
            className="w-44 h-44 rounded-lg object-cover mb-4"
          />
          {/* <span className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full mb-4">
            {user?.isActive ? "Active" : "Not Active"}
          </span> */}
        </div>

        {/* User Info */}
        <div className="text-md text-gray-400 space-y-2 grid sm:grid-cols-1 md:grid-cols-2 lg:flex flex-col pl-2 w-full overflow-hidden">
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Fullname</span>
            <span className="truncate">{user?.name}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Username</span>
            <span className="truncate">{user?.userName}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Email</span>
            <span className="truncate">{user?.email}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Date of birth</span>
            <span>{user?.dob}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Country</span>
            <span className="truncate">{user?.country}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Currency</span>
            <span className="truncate">{user?.currency}</span>
          </p>
          <p className="flex flex-col truncate">
            <span className="font-medium text-white">Referral Code</span>
            <span className="truncate">{user?.referralCode}</span>
          </p>
        </div>
      </div>

      {/* Modal for Editing */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleOnSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="flex flex-col">
                <label htmlFor="image">Profile Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleOnChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              {/* Full Name */}
              <div className="flex flex-col">
                <label htmlFor="name">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData?.name}
                  onChange={handleOnChange}
                  placeholder="Full Name"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Username */}
              {/* <div className="flex flex-col">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleOnChange}
                  placeholder="Username"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}

              {/* Email */}
              {/* <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleOnChange}
                  placeholder="example@gmail.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}

              {/* Phone No. */}
              {/* <div className="flex flex-col">
                <label htmlFor="phone">Phone No.</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleOnChange}
                  placeholder="+91 9876543210"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}

              {/* Date of Birth */}
              {/* <div className="flex flex-col">
                <label htmlFor="phone">Date of birth</label>
                <input
                  type="text"
                  name="dob"
                  value={formData.dob}
                  onChange={handleOnChange}
                  placeholder="12/05/2025"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}

              {/* Gender */}
              {/* <div className="flex flex-col">
                <label htmlFor="gender">Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleOnChange}
                  placeholder="Male"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}

              {/* Country */}
              {/* <div className="flex flex-col">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleOnChange}
                  placeholder="India"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div> */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2 bg-dark border border-gray-400 hover:bg-dark/50 rounded-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-green hover:bg-green/90 rounded-md font-semibold cursor-pointer"
                >
                  {isLoading ? "Processing..." : "Updated Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
