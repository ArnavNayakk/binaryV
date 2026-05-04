import React from "react";
import PostCard from "../../components/forum/PostCard";
// import SearchBar from "../../components/forum/SearchBar";
import { FiPlus } from "react-icons/fi";

const beginnerPosts = [
  {
    id: 1,
    title: "How to start trading with ₹500?",
    author: "Ankit",
    replies: 8,
    time: "1h ago",
  },
  {
    id: 2,
    title: "What is OHLC?",
    author: "Priya",
    replies: 5,
    time: "3h ago",
  },
  {
    id: 3,
    title: "Is Upstox better than Zerodha?",
    author: "Shyam",
    replies: 6,
    time: "1d ago",
  },
];

const BeginnerForum = () => {
  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Beginner Forum</h2>
        {/* <SearchBar /> */}
      </div>

      <div className="space-y-4">
        {beginnerPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Add Post Button */}
      <button className="fixed bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg hover:bg-indigo-700">
        <FiPlus size={24} />
      </button>
    </div>
  );
};

export default BeginnerForum;
