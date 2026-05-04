import React, { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import discussions from "../../assets/discussions";
import { useParams } from "react-router-dom";

const DiscussionPage = () => {
  const { id } = useParams();

  // Finding discussion with id from localeStorage
  const discussion = JSON.parse(localStorage.getItem("discussions")).find(
    (d) => d.id === Number(id)
  );

  // State for new comment
  const [newComment, setNewComment] = useState("");

  // Add comment function
  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const newEntry = {
      id: discussion.comments.length + 1,
      author: "You", 
      date: new Date().toLocaleDateString(),
      text: newComment,
    };

    // Get Existing discussions from localeStorage
    let discussions = JSON.parse(localStorage.getItem("discussions")) || [];

    // Find the discussion by Id and Update
    discussions = discussions.map((d) => {
      if (d.id === Number(id)) {
        return {
          ...d,
          comments: [...(d.comments || []), newEntry],
        };
      }
      return d;
    });

    //  Save back to localeStorage
    localStorage.setItem("discussions", JSON.stringify(discussions));
    setNewComment("");
  };

  return (
    <section className="min-h-screen bg-dark text-white py-20">
      {/* Main Discussion */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-2xl font-bold mb-3">{discussion?.title}</h1>
        <p className="text-gray-400 text-sm mb-4">
          Posted by <span className="text-green">{discussion?.author}</span> •{" "}
          {discussion?.date}
        </p>
        <p className="text-gray-200 leading-relaxed">
          {discussion?.description}
        </p>
      </div>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({discussion?.comments.length})
        </h2>

        {/* Add Comment Form */}
        <form
          onSubmit={handleAddComment}
          className="flex gap-3 items-center bg-gray-800 p-4 rounded-2xl shadow"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-green hover:bg-green-500 px-4 py-2 rounded-xl cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {discussion?.comments.length > 0 &&
            discussion?.comments.map((c) => (
              <div key={c.id} className="bg-gray-800 p-4 rounded-xl shadow">
                <p className="text-sm text-gray-400 mb-1">
                  <span className="text-green font-semibold">{c.author}</span> •{" "}
                  {c.date}
                </p>
                <p className="text-gray-200">{c.text}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default DiscussionPage;
