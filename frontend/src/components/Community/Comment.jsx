import React, { useState } from "react";
import { FiHeart, FiMessageCircle, FiSend } from "react-icons/fi";

const Comment = ({ comment, postId, addComment, likeComment }) => {
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [showComments, setShowComments] = useState(false);

  console.log(comment);
  return (
    <div className="mb-3">
      <div className="bg-[#161616] p-3 rounded-lg">
        <p className="font-medium">{comment.author.name}</p>
        <p className="text-gray-300">{comment.content}</p>

        <div className="flex items-center gap-6 mt-1 text-gray-400">
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-sm text-blue-400 "
          >
            Reply
          </button>
          <div
            onClick={() => likeComment(postId, comment.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <FiHeart /> {comment?.likes}
          </div>
          <div
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <FiMessageCircle /> {comment?.replies?.length}
          </div>
        </div>

        {/* Reply Box */}
        {showReply && (
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 bg-[#0e0e0e] p-2 rounded-lg"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              onClick={() => {
                addComment(postId, replyText, comment);
                setReplyText("");
                setShowReply(false);
              }}
              className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
            >
              <FiSend />
            </button>
          </div>
        )}
      </div>

      {showComments && (
        <div className="ml-6 mt-2 space-y-3">
          {comment.replies.map((r) => (
            <Comment
              key={r.id}
              comment={r}
              postId={postId}
              addComment={addComment}
              likeComment={likeComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
