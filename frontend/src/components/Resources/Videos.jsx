import React from "react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import PageLoader from "../Loader/PageLoader";
import { getWithExpiry, setWithExpiry } from "../../helper/storageWithExpiry";
import assets from "../../assets/assets";

const Videos = () => {
  const { isLoading, setIsLoading } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const navigate = useNavigate();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Fetch all tutorials
  const fetchTutorials = async () => {
    try {
      setIsLoading(true);
      const cached = getWithExpiry("tutorials");
      if (cached) {
        setTutorials(cached);
        return;
      }
      const { data } = await api.cachedGet("/api/tutorial/get");
      setTutorials(data?.data || []);
      setWithExpiry("tutorials", data?.data, ONE_DAY);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load tutorials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // Extract YouTube Thumbnail
  const getThumbnail = (url) => {
    try {
      const videoId = new URL(url).searchParams.get("v");
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch {
      return "https://via.placeholder.com/300x200?text=Video";
    }
  };

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <PageLoader />
      ) : tutorials.length === 0 ? (
        <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
          <p className="text-2xl text-gray-500">No Tutorial found..</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green text-white px-3 py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      ) : (
        <section className="bg-dark text-white py-16 px-6 md:px-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Trading <span className="text-green">Video Tutorials</span>
          </h1>

          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-6">
            Learn trading concepts through step-by-step video tutorials. Watch
            and master everything from beginner basics to advanced strategies.
          </p>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((video) => (
              <div
                key={video._id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-green transition transform hover:-translate-y-2"
              >
                <a
                  href={`/resources/videos/${video._id}`}
                  // target="_blank"
                  rel="noopener noreferrer"
                  className="relative block group"
                >
                  <img
                    src={getThumbnail(video.videoLink)}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />

                  {/* YouTube Play Icon */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-100">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center opacity-80 transition">
                      <img
                        className="hover:scale-102 duration-300"
                        src={assets.youtube}
                        alt="YouTube Logo"
                      />
                    </div>
                  </div>
                </a>

                <div className="p-5 flex flex-col justify-between">
                  <h3 className="text-xl font-semibold text-green mb-2 h-12">
                    {video.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {video.description}
                  </p>
                  <a
                    href={video.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-green font-medium hover:underline"
                  >
                    Watch Video →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Videos;
