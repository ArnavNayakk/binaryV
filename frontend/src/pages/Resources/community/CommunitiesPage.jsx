import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axiosClient";
import { toast } from "react-hot-toast";
import PageLoader from "../../../components/Loader/PageLoader";
import { getSocket } from "../../../socket";

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem("allCommunities");
    return saved ? JSON.parse(saved) : [];
  });
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [communityId, setCommunityId] = useState(null);
  const { isLoading, setIsLoading } = useAuth();

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/community/get");
      if (data.success) {
        setCommunities(data?.data);
        localStorage.setItem("allCommunities", JSON.stringify(data?.data));
      }
    } catch (error) {
      console.log("Get communities Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJoinedCommunities = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/community/user");
      setJoinedCommunities(data?.data);
    } catch (error) {
      console.log("Get User communities Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    setIsLoading(true);
    try {
      setCommunityId(communityId);
      const { data } = await api.post(`/api/community/join/${communityId}`);
      console.log(data);
      if (data.success) {
        toast.success("joined community successfully.");
        fetchJoinedCommunities();
      }
    } catch (error) {
      console.log("Join community Error:", error);
      toast.error(error?.response?.data?.message || "Join community failed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("joinCommunity", communityId);

    socket.on("memberJoined", (data) => {
      toast.success("New member joined community!");
      console.log("Event from server:", data);
    });

    return () => {
      socket.emit("leaveRoom", communityId);
      socket.off("memberJoined");
    };
  }, [communityId]);

  useEffect(() => {
    fetchCommunities();
    fetchJoinedCommunities();
  }, []);
  console.log(joinedCommunities);
  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="min-h-screen bg-dark text-white p-4 space-y-10">
          {/* Joined Communities */}
          <section className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Joined Communities</h2>
            {joinedCommunities.length === 0 ? (
              <div className="flex justify-center items-center text-gray-500">
                You haven't joined any community yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {joinedCommunities.map((com) => (
                  <div
                    key={com._id}
                    className="p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700"
                    onClick={() => navigate(`${com?.community?._id}`)}
                  >
                    <h3 className="font-semibold text-lg">
                      {com?.community?.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {com?.community?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* All Communities */}
          <section>
            <h2 className="text-xl font-bold mb-3">All Communities</h2>
            {communities.length === 0 ? (
              <div className="flex justify-center items-center text-gray-500">
                No community found!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                {communities.map((com) => (
                  <div key={com._id} className="p-4 bg-zinc-800 rounded-lg">
                    <h3 className="font-semibold text-lg">{com.name}</h3>
                    <p className="text-sm text-gray-400">{com.description}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`${com._id}`)}
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 py-1 rounded cursor-pointer"
                      >
                        Open Community
                      </button>
                      <button
                        onClick={() => handleJoinCommunity(com._id)}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 py-1 rounded cursor-pointer"
                      >
                        {isLoading ? "Joining..." : "Join Community"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default CommunitiesPage;
