import React from "react";
import { FiMessageCircle } from "react-icons/fi";

const PostCard = ({ post }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:bg-gray-750 cursor-pointer">
      <h3 className="text-lg font-semibold">{post.title}</h3>

      <div className="flex items-center justify-between mt-2 text-gray-400 text-sm">
        <span>By {post.author}</span>

        <div className="flex items-center gap-2">
          <FiMessageCircle />
          {post.replies} replies
        </div>

        <span>{post.time}</span>
      </div>
    </div>
  );
};

export default PostCard;
