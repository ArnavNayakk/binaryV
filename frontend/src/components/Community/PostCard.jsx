import React, { useState } from "react";
import Comment from "./Comment";
import { FiHeart, FiMessageCircle, FiSend } from "react-icons/fi";

const PostCard = ({ post, addComment, likePost, likeComment }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-md">
      {/* Post Header */}
      <h4 className="font-semibold text-lg">{post.author.name}</h4>
      <p className="mt-2 text-gray-300">{post.content}</p>

      {/* Post Actions */}
      <div className="flex items-center gap-6 mt-4 text-gray-400">
        <div
          onClick={() => likePost(post.id)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <FiHeart /> {post.likes}
        </div>
        <div
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1"
        >
          <FiMessageCircle /> {post?.comments?.length}
        </div>
      </div>

      {/* Add Comment */}
      <div className="flex items-center mt-4 gap-2">
        <input
          className="flex-1 bg-[#111] p-2 rounded-lg focus:outline-none"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          onClick={() => {
            addComment(post.id, commentText);
            setShowComments(true);
            setCommentText("");
          }}
          className="p-2 bg-green rounded-lg hover:bg-green-700"
        >
          <FiSend />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 ml-4">
          {post.comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              postId={post.id}
              addComment={addComment}
              likeComment={likeComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
