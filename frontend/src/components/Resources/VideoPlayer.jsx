import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { getWithExpiry } from "../../helper/storageWithExpiry";

const VideoPlayer = () => {
  const { id } = useParams();
  const [tutorials, setTutorials] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const data = getWithExpiry("tutorials"); // load cached tutorials
    if (data) setTutorials(data);
  }, []);

  // Find selected video
  const currentVideo = tutorials.find((v) => v._id === id);

  // Get YouTube Video ID
  const getYoutubeId = (url) => {
    try {
      return new URL(url).searchParams.get("v");
    } catch {
      return null;
    }
  };

  if (!currentVideo) return <p>Video not found</p>;

  return (
    <div className="bg-dark min-h-screen text-white my-20 lg:my-12 px-6 md:p-10 flex flex-col md:flex-row gap-8">
      {/* Left: Video Player Area */}
      <div className="w-full md:w-3/4">
        <div className="bg-black rounded-xl overflow-hidden shadow-lg">
          <ReactPlayer
            src={currentVideo.videoLink}
            width="100%"
            height="450px"
            controls
          />
        </div>

        {/* Video Title */}
        <h1 className="text-2xl font-bold mt-4">{currentVideo.title}</h1>

        {/* Description */}
        <p
          className={`text-gray-300 mt-3 leading-relaxed ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {currentVideo.description}
        </p>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-green cursor-pointer">
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </div>

      {/* Right: Suggested Videos */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-semibold mb-4">Suggested Videos</h2>

        <div className="flex flex-col gap-4">
          {tutorials
            .filter((v) => v._id !== id)
            .map((v) => (
              <a
                key={v._id}
                href={`/resources/videos/${v._id}`}
                className="flex gap-3 bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
              >
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeId(
                    v.videoLink
                  )}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-32 h-20 object-cover"
                />

                <div className="p-2 flex flex-col justify-between">
                  <p className="font-medium text-sm line-clamp-2">{v.title}</p>
                  <span className="text-xs text-gray-400">Watch now</span>
                </div>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
