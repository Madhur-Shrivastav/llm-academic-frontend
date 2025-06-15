import { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import "react-markdown";
import Markdown from "react-markdown";

const ChatArea = () => {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]); // Initialize with empty array
  const [userId, setUserId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = JSON.parse(localStorage.getItem("user")).id;

    if (!token || !storedUserId) {
      navigate("/auth/login");
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() && userId) {
      const userMessage = {
        role: "user",
        content: inputValue.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}guidance/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              session_id: currentSessionId,
              question: userMessage.content, // Changed 'message' to 'question'
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Chat API error:", errorData);
          // Revert optimistic update or show error message
          setMessages((prev) => prev.slice(0, -1)); // Remove last user message
          // Add a bot error message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant", // Changed from "ai" to "assistant"
              content: `Error: ${
                errorData.detail || "Could not send message."
              }`,
              timestamp: new Date().toISOString(),
            },
          ]);
          return;
        }

        const sessionData = await response.json(); // Expected: { session_id, response, source_documents }
        setCurrentSessionId(sessionData.session_id); // Corrected: use session_id

        const aiMessage = {
          role: "assistant", // Use "assistant" role
          content: sessionData.response,
          timestamp: new Date().toISOString(),
          source_documents: sessionData.source_documents || [],
        };
        // Append AI's message to the state
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
        // Revert optimistic update or show error message
        setMessages((prev) => prev.slice(0, -1)); // Remove last user message
        let errorMessage = "Error: Could not connect to the chat service.";
        if (error.message.includes("CORS") || error.name === "TypeError") {
          errorMessage =
            "Error: Network connection issue. Please check your internet connection.";
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant", // Changed from "ai" to "assistant"
            content: errorMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-700">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 relative">
        <span className="font-semibold text-lg text-blue-600">
          TrueYou Careers
        </span>

        <div className="flex items-center gap-2 p-2">
          <div
            onClick={() => setOpen((prev) => !prev)}
            className="flex justify-center items-center gap-1 hover:cursor-pointer hover:scale-105 transition"
          >
            <img
              src="/public/image.png"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>

          {open && (
            <div className="absolute right-4 top-16 w-60 bg-gray-800 shadow-2xl rounded-xl z-50 border border-gray-600">
              <ul className="flex flex-col">
                <Link
                  to="/profile"
                  className="px-6 py-3 hover:bg-gray-700 text-white text-base rounded-t-xl transition-all duration-200 flex items-center gap-2"
                >
                  <CgProfile />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="px-6 py-3 hover:bg-gray-700 text-white text-base transition-all duration-200 flex items-center gap-2"
                >
                  <IoMdSettings />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user_id"); // Changed from "user"
                    localStorage.removeItem("loginTime");
                    navigate("/auth/login");
                  }}
                  className="px-6 py-3 hover:bg-red-600 text-white text-base rounded-b-xl transition-all duration-200 flex items-center gap-2"
                >
                  <CiLogout />
                  Logout
                </button>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-6">
        <div className="w-full max-w-3xl space-y-4">
          <div className="text-center mt-2">
            <h1 className="text-2xl md:text-3xl font-semibold mb-6">
              What can I help with?
            </h1>
          </div>

          {messages &&
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[75%] text-sm ${
                    msg.role === "user"
                      ? "bg-yellow-200 text-gray-700 rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <Markdown>{msg.content}</Markdown>
                  {msg.role === "assistant" &&
                    msg.source_documents &&
                    msg.source_documents.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <small className="text-xs text-gray-400">
                          Sources ({msg.source_documents.length}):
                        </small>
                        <ul className="list-disc list-inside pl-2 text-xs">
                          {msg.source_documents.map((doc, i) => (
                            <li
                              key={i}
                              className="truncate"
                              title={doc.metadata?.source || "Unknown source"}
                            >
                              {doc.metadata?.source?.split("/").pop() ||
                                "Source document"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg max-w-[75%] text-sm bg-gray-700 text-gray-100 rounded-bl-none">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex items-center bg-yellow-100 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask anything..."
              className="flex-1 mx-2 bg-transparent text-gray-700 outline-none text-sm placeholder-gray-400"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                inputValue.trim() && !loading
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-yellow-600 text-white cursor-not-allowed"
              }`}
            >
              <FiSend />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
