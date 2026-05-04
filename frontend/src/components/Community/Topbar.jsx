import { PlusCircle, Search } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";

const Topbar = () => {
  const { user } = useAuth();
  console.log(user);
  const [isCreateCommunity, setIsCreateCommunity] = useState(false);
  const { isLoading, setIsLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  // Handle onChange event of add Discussion form input
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await api.post("/api/community/create", formData);
      if (data.success) {
        toast.success(data?.message || "Community Created successfully.");
        setFormData({
          name: "",
          description: "",
          category: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Community creation failed."
      );
    } finally {
      setIsLoading(false);
      setIsCreateCommunity(false);
    }
  };

  return (
    <div className=" w-full px-4 py-2 flex justify-between items-center bg-dark text-white">
      <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
        Community Forum
      </div>
      {/* Search bar */}
      <div className="hidden md:flex relative w-full max-w-3xl">
        <input
          type="text"
          placeholder="Search trades, users..."
          className="border px-4 py-2 rounded-lg w-full"
        />
        <Search className="absolute top-2 right-2" />
      </div>

      <div className="flex items-center space-x-4 ml-4">
        {/* Add Community Button */}
        <button
          onClick={() => setIsCreateCommunity(true)}
          className="flex items-center gap-2 hover:bg-green rounded-2xl shadow-lg duration-200 cursor-pointer"
        >
          <PlusCircle size={36} />
        </button>
        {/* <button className="text-xl">🔔</button> */}
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-green-500">
          {user?.image
            ? user?.image
            : `${user?.name.split(" ")[0]?.charAt(0)}${user?.name
                .split(" ")[1]
                ?.charAt(0)}`}
        </div>
      </div>

      {/* Modal for Create Community */}
      {isCreateCommunity && (
        <div className="fixed inset-0 backdrop-blur flex justify-center items-center shadow-2xl">
          <div className="w-100 bg-dark text-white p-6 rounded-lg space-y-4 pb-10">
            <h2 className="text-xl font-semibold">Create Your Community</h2>

            <form className="space-y-4">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label>Community Title</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleOnChange}
                  required
                  placeholder="Best Forex strategies in 2025?"
                  className="border px-3 py-2 rounded-lg"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleOnChange}
                  placeholder="Description"
                  className="border px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreateCommunity(false)}
                  className="w-full p-2 border rounded-lg cursor-pointer hover:text-green/90 duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCommunity}
                  className="w-full p-2 bg-green rounded-lg cursor-pointer hover:bg-green/80 duration-200"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
