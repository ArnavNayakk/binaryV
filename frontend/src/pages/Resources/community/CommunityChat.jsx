import React, { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { getSocket } from "../../../socket";
import api from "../../../api/axiosClient";
import { useParams } from "react-router-dom";
import PageLoader from "../../../components/Loader/PageLoader";

const allUsers = [
  { id: "693164719620b314d93d94b7", name: "Admin", username: "admin" },
  { id: "u2", name: "John", username: "john" },
  { id: "u3", name: "Suraj", username: "suraj" },
];

const emojis = ["👍", "❤️", "😂", "😮", "💯", "🙏"];

const CommunityChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [activeEmojiMsg, setActiveEmojiMsg] = useState(null);
  const [mentionList, setMentionList] = useState([]);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const { isLoading, setIsLoading } = useAuth();
  const [members, setMembers] = useState([]);
  const { communityId } = useParams();

  const allCommunities = JSON.parse(localStorage.getItem("allCommunities"));
  let community = allCommunities.filter((c) => c._id === communityId);
  community = community[0];
  // console.log(community);

  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localTypingRef = useRef(false);

  // Helper: normalize server message to UI shape
  const normalizeMessage = (m) => {
    // server may return { _id, text, sender, createdAt, reactions, reads, replyToMessage }
    const id = m._id || m.id;
    const author =
      (m.sender &&
        (m.sender.userName
          ? {
              _id: m.sender._id || m.sender.id,
              name: m.sender.userName,
              username: m.sender.username,
              image: m.sender.image,
            }
          : m.sender)) ||
      m.author ||
      allUsers[0];

    // reactions may be object { emoji: [userId] } or array [{ emoji, users }]
    let reactions = [];
    if (Array.isArray(m.reactions)) {
      reactions = m.reactions.map((r) => ({
        emoji: r.emoji,
        users: r.users || [],
      }));
    } else if (m.reactions && typeof m.reactions === "object") {
      reactions = Object.entries(m.reactions).map(([emoji, users]) => ({
        emoji,
        users: users || [],
      }));
    }

    const reply =
      m.replyToMessage && typeof m.replyToMessage === "object"
        ? {
            text: m.replyToMessage.text,
            author: m.replyToMessage.sender || m.replyToMessage.author,
          }
        : m.reply || null;

    return {
      id,
      _raw: m,
      text: m.text || m.content || "",
      author,
      reply,
      reactions,
      reads: m.reads || m.readBy || [],
      time: m.createdAt
        ? new Date(m.createdAt).getTime()
        : m.time || Date.now(),
    };
  };

  const fetchCommunityMembers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/api/community/member/${communityId}`);
      if (data.success) {
        setMembers(data?.data);
      }
    } catch (error) {
      console.log("Fetch community members Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // fetch message history
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      if (!communityId) return;
      const { data } = await api.get(`api/message/community/${communityId}`);
      const msgs = (data?.data || []).map(normalizeMessage);
      setMessages(msgs);
      markVisibleMessagesRead(msgs);
    } catch (err) {
      console.error("Fetch messages:", err?.response?.data || err.message);
      // toast?.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchCommunityMembers();
  }, [communityId]);

  // join socket room + listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !communityId) return;

    socket.emit("joinCommunity", communityId);

    const onNew = (msg) => {
      try {
        const nm = normalizeMessage(msg);
        // only push messages for current community
        if (
          msg.community &&
          (msg.community === communityId || msg.community._id === communityId)
        ) {
          setMessages((prev) => [...prev, nm]);
          // auto mark read for current user (optimistic)
          socket.emit("message:read", { messageId: nm.id, communityId });
        }
      } catch (e) {
        console.error("onNew normalize err", e);
      }
    };

    const onReactionAdd = ({ messageId, userId, emoji }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            if (!existing.users.includes(userId)) existing.users.push(userId);
          } else {
            m.reactions.push({ emoji, users: [userId] });
          }
          return { ...m };
        })
      );
    };

    const onReactionRemove = ({ messageId, userId, emoji }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.users = existing.users.filter((id) => id !== userId);
            if (existing.users.length === 0)
              m.reactions = m.reactions.filter((r) => r.emoji !== emoji);
          }
          return { ...m };
        })
      );
    };

    const onTypingStart = ({ userId }) => {
      // we store typing users as array on message level; here we keep separate state via messages' special reaction? simpler: add a synthetic message? Keep minimal: we won't show who exactly typed; keep typing indicator in input component via socket events (see below)
      // Add a lightweight signal by setting a temporary message? Not necessary here; we'll handle typing indicator separately via a small state below
    };

    const onRead = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reads: Array.from(new Set([...(m.reads || []), userId])) }
            : m
        )
      );
    };

    socket.on("message:new", onNew);
    socket.on("message:reaction:add", onReactionAdd);
    socket.on("message:reaction:remove", onReactionRemove);
    socket.on("message:read", onRead);
    socket.on("typing:start", onTypingStart);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:reaction:add", onReactionAdd);
      socket.off("message:reaction:remove", onReactionRemove);
      socket.off("message:read", onRead);
      socket.off("typing:start", onTypingStart);
    };
  }, [communityId, user?._id]);

  // Scroll behaviour
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      try {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } catch {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  };

  // Typing indicator: emit typing:start and typing:stop
  const emitTypingStart = () => {
    const socket = getSocket();
    if (!socket || !communityId) return;
    if (localTypingRef.current) {
      // refresh stop timer
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(emitTypingStop, 2500);
      return;
    }
    localTypingRef.current = true;
    socket.emit("typing:start", { communityId });
    typingTimeoutRef.current = setTimeout(emitTypingStop, 2500);
  };

  const emitTypingStop = () => {
    const socket = getSocket();
    if (!socket || !communityId) return;
    localTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing:stop", { communityId });
  };

  // Detect @mentions while typing (keeps your UI intact)
  const handleTyping = (value) => {
    setText(value);
    emitTypingStart();

    const lastWord = value.split(/\s+/).pop() || "";
    if (lastWord.startsWith("@")) {
      const query = lastWord.substring(1).toLowerCase();
      const filtered = allUsers.filter((u) =>
        u.username.toLowerCase().includes(query)
      );
      setMentionList(filtered);
    } else {
      setMentionList([]);
    }
  };

  // When user clicks a mention suggestion
  const pickMention = (u) => {
    const replacement = `@${u.username} `;
    const newText = text.replace(/@\w*$/, replacement);
    setText(newText);
    setMentionList([]);
  };

  // Send message via socket (backend will persist & broadcast)
  const sendMessage = async () => {
    if (!text || !text.trim()) return;

    const payload = {
      communityId,
      text: text.trim(),
      images: [],
      reply: replyTo ? { text: replyTo.text, author: replyTo?.author } : null,
      replyToMessage: replyTo?._raw?._id || replyTo?.id || null,
      replyToPost: null,
      mentions: extractMentions(text),
    };

    // optimistic UI: add temporary message with a temp id
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text: payload.text,
      author: user,
      reply: replyTo ? { text: replyTo.text, author: replyTo.author } : null,
      reactions: [],
      reads: [user._id],
      time: Date.now(),
    };
    // setMessages((p) => [...p, optimistic]); //Optimistic UI update
    setText("");
    setReplyTo(null);

    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("message:send", payload); // backend will emit message:new
      } else {
        // fallback to REST if socket not available
        const { data } = await api.post(
          `api/message/send/${communityId}`,
          payload
        );
        const nm = normalizeMessage(data?.data);
        setMessages((p) => [...p.filter((m) => m.id !== tempId), nm]);
      }
    } catch (err) {
      console.error("Send message error:", err?.response?.data || err.message);
      // revert optimistic state: remove temp message
      setMessages((p) => p.filter((m) => m.id !== tempId));
      // toast?.error("Failed to send message");
    } finally {
      emitTypingStop();
    }
  };

  // Extract @mentions as array of usernames or ids depending on backend contract
  const extractMentions = (txt) => {
    const matches = [...txt.matchAll(/@([a-zA-Z0-9_]+)/g)].map((m) => m[1]);
    // map to user ids if you have mapping, otherwise return usernames
    const mentionUsers = allUsers
      .filter((u) => matches.includes(u.username))
      .map((u) => u.id);
    return mentionUsers;
  };

  // Toggle reaction: will emit message:reaction:add or :remove
  const toggleReaction = (messageId, emoji) => {
    const socket = getSocket();
    if (!socket || !communityId) return;

    // find message & check if current user already reacted with this emoji
    const msg = messages.find((m) => m.id === messageId);
    const existing = msg?.reactions?.find((r) => r.emoji === emoji);
    const hasReacted = existing ? existing.users.includes(user._id) : false;

    // Optimistic update locally
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        let newReactions = [...(m.reactions || [])];
        if (hasReacted) {
          newReactions = newReactions.map((r) =>
            r.emoji === emoji
              ? { ...r, users: r.users.filter((id) => id !== user._id) }
              : r
          );
          newReactions = newReactions.filter((r) => r.users.length > 0);
        } else {
          const found = newReactions.find((r) => r.emoji === emoji);
          if (found) {
            found.users = Array.from(
              new Set([...(found.users || []), user._id])
            );
          } else {
            newReactions.push({ emoji, users: [user._id] });
          }
        }
        return { ...m, reactions: newReactions };
      })
    );

    // emit socket
    socket.emit(
      hasReacted ? "message:reaction:remove" : "message:reaction:add",
      { communityId, messageId, emoji }
    );
  };

  // Mark visible messages as read
  const markVisibleMessagesRead = (msgs = messages) => {
    const socket = getSocket();
    if (!socket || !communityId) return;
    // mark last N messages or last message
    if (msgs.length === 0) return;
    const last = msgs[msgs.length - 1];
    socket.emit("message:read", { messageId: last.id, communityId });
  };

  // Delete message (calls API then removes locally). only for my messages
  const deleteMessage = async (messageId) => {
    try {
      // optimistic UI remove
      const orig = messages;
      setMessages((p) => p.filter((m) => m.id !== messageId));
      await api.delete(`/api/message/delete/${messageId}`);
      // optionally inform server via socket (if backend supports)
      const socket = getSocket();
      socket?.emit("message:deleted", { communityId, messageId });
    } catch (err) {
      // revert on error
      toast?.error(error?.response?.data?.message || "Failed to delete");
      fetchMessages();
      console.error(
        "Delete message error:",
        err?.response?.data || err.message
      );
    }
    setActiveActionMenu(null);
  };

  // Helper to toggle UI action menu or emoji popup
  useEffect(() => {
    const closePopup = (e) => {
      if (
        !e.target.closest(".emoji-popup") &&
        !e.target.closest(".action-menu")
      ) {
        setActiveActionMenu(null);
        setActiveEmojiMsg(null);
      }
    };

    document.addEventListener("click", closePopup);
    return () => document.removeEventListener("click", closePopup);
  }, []);

  // Reaction click from action menu (keeps UI the same)
  const onActionReactionClick = (msgId, emoji) => {
    toggleReaction(msgId, emoji);
    setActiveActionMenu(null);
    setActiveEmojiMsg(null);
  };

  // Copy text helper
  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setActiveActionMenu(null);
    // toast?.success("Copied");
  };

  // small render helpers
  const isMine = (msg) =>
    msg.author?._id === user?._id || msg.author?.id === user?._id;

  console.log(messages);

  return (
    <div className="h-[80vh] bg-[#0f0f0f] flex flex-col text-white rounded-lg overflow-hidden mt-4">
      {/* Header */}
      <div className="p-4 bg-zinc-900 border-b border-zinc-700">
        <h2 className="text-xl font-semibold">{community?.name}</h2>
        <p>{community?.description.slice(0, 50)}...</p>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
        ref={chatContainerRef}
        style={{ scrollBehavior: "smooth" }}
      >
        {isLoading ? (
          <PageLoader />
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMine(msg);
            return (
              <div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%]">
                  {!mine && (
                    <div className="flex gap-1 text-xs text-green-300 font-semibold mb-1">
                      <p className="w-4 h-4">
                        <img
                          src={msg?.author?.image}
                          alt={`${msg?.author?.name} profile image`}
                          className="object-contain rounded-full"
                        />
                      </p>
                      <span>{msg.author?.name}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-2 py-1 rounded-2xl shadow-lg ${
                      mine
                        ? "bg-green/50 text-white rounded-tr-none"
                        : "bg-zinc-800 rounded-tl-none"
                    }`}
                  >
                    {/* Reply Preview */}
                    {msg.reply && (
                      <div className="text-xs flex flex-col text-gray-400 border-l-2 bg-gray-800 px-2 py-1 rounded-t-md rounded-b-sm border-white pl-2 mb-1">
                        <span>{msg.reply.author}</span>
                        {msg.reply.text?.slice(0, 25)}...
                      </div>
                    )}

                    <p className="whitespace-pre-line">
                      {msg.text}{" "}
                      <span className="text-xs text-gray-400">
                        {new Date(msg.time).toLocaleTimeString()}
                      </span>
                    </p>

                    {/* Reactions */}
                    {msg.reactions?.length > 0 && (
                      <div className="flex mt-2 gap-2">
                        {msg.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => toggleReaction(msg.id, r.emoji)}
                            className="bg-black/30 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            <span>{r.emoji}</span>
                            <span className="text-[11px]">
                              {r.users?.length || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Three-dot button for actions */}
                  <div className="relative flex justify-end mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveActionMenu(
                          activeActionMenu === msg.id ? null : msg.id
                        );
                      }}
                      className={`relative ${
                        mine ? "-top-8 left-4" : " -top-8 -right-4"
                      } text-gray-400 hover:text-white px-2`}
                    >
                      ⋮
                    </button>

                    {/* action menu */}
                    {activeActionMenu === msg.id && (
                      <div
                        className={`absolute z-50 action-menu bg-zinc-800 rounded-xl shadow-xl p-2 w-44 ${
                          mine ? " right-6" : "left-0"
                        }`}
                      >
                        {/* Reactions Row */}
                        <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-2">
                          {emojis.map((e) => (
                            <span
                              key={e}
                              onClick={() => onActionReactionClick(msg.id, e)}
                              className="text-xl cursor-pointer hover:scale-125 transition"
                            >
                              {e}
                            </span>
                          ))}
                        </div>

                        {/* Reply */}
                        <button
                          onClick={() => {
                            setReplyTo(msg);
                            setActiveActionMenu(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded hover:bg-zinc-700"
                        >
                          Reply
                        </button>

                        {/* Copy Text */}
                        <button
                          onClick={() => {
                            copyText(msg.text);
                          }}
                          className="w-full text-left px-2 py-1 rounded hover:bg-zinc-700"
                        >
                          Copy
                        </button>

                        {/* Delete (only my message) */}
                        {mine && (
                          <button
                            onClick={() => {
                              deleteMessage(msg.id);
                            }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-red-600 text-red-400"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-700 text-xs flex justify-between">
          <div>
            Replying to{" "}
            <span className="text-green">{replyTo.author?.name}</span>: "
            {replyTo.text?.slice(0, 25)}..."
          </div>
          <button onClick={() => setReplyTo(null)}>✖</button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-700 flex gap-2 relative">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-lg outline-none"
        />

        {/* Mention suggestions */}
        {mentionList.length > 0 && (
          <div className="absolute bottom-14 left-4 bg-zinc-800 rounded-lg shadow-lg p-2">
            {mentionList.map((u) => (
              <div
                key={u.id}
                onClick={() => pickMention(u)}
                className="p-1 hover:bg-zinc-700 cursor-pointer"
              >
                @{u.username}
              </div>
            ))}
          </div>
        )}

        <button onClick={sendMessage} className="bg-green px-4 rounded-lg">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default CommunityChat;
