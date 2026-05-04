import React, { useEffect, useState } from "react";
import { MessageCircle, PlusCircle, Search } from "lucide-react";
import discussionsData from "../../assets/discussions";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";
import toast from "react-hot-toast";

const Community = () => {
  const [search, setSearch] = useState("");
  const [discussions, setDiscussions] = useState(() => {
    const saved = localStorage.getItem("discussions");
    return saved ? JSON.parse(saved) : discussionsData;
  });
  const [filteredDiscussions, setFilteredDiscussions] = useState(discussions);
  const navigate = useNavigate();

  // Hnadle onSubmit formData
  const addDiscussion = (formData) => {
    setDiscussions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: "You",
        ...formData,
        date: new Date().toLocaleDateString(),
        comments: [],
      },
    ]);
  };

  // Filter Discussion based in the search
  const handleFilterDiscussion = (e) => {
    const filtered = discussions.filter(
      (d) =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.author.toLowerCase().includes(search.toLowerCase()) ||
        d.category.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDiscussions(filtered);
  };

  const categories = ["All", "Forex", "Stocks", "Crypto", "Options", "General"];

  useEffect(() => {
    localStorage.setItem("discussions", JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    handleFilterDiscussion();
  }, [search]);

  return (
    <section className="min-h-screen h-full bg-dark text-white py-6">
      {/* Discussions List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                navigate(`${d.id}`), scrollTo(0, 0);
              }}
              className="bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold cursor-pointer hover:text-green duration-200">
                  {d.title}
                </h2>
                <span className="text-sm bg-green/30 px-3 py-1 rounded-full">
                  {d.category}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Posted by <span className="text-green">{d.author}</span> •{" "}
                {d.date}
              </p>
              <div className="flex items-center gap-2 mt-4 text-gray-400">
                <MessageCircle className="w-5 h-5" />
                {d?.comments.length || 0} Replies
              </div>
            </div>
          ))
        ) : (
          <p className="min-h-100 text-3xl font-semibold text-gray-400 flex justify-center items-center">
            No Discussions found
          </p>
        )}
      </div>
    </section>
  );
};

export default Community;
