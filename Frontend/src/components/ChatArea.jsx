import { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import "react-markdown";
import Markdown from "react-markdown";
import { RiAiGenerate2 } from "react-icons/ri";

const ChatArea = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query === "") {
      navigate("/chat", { replace: true });
    }
    if (query) {
      setInputValue(query);
      navigate("/chat", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      navigate("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser?.id) {
        navigate("/auth/login");
        return;
      }

      setUserId(parsedUser.id);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      navigate("/auth/login");
    }
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

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  async function downloadReport() {
    const storedUser = localStorage.getItem("user");
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser?.id;

    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    setIsGeneratingReport(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}report/generate/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "text/html",
          },
        }
      );

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          console.log("Failed to parse error response:", e);
        }
        throw new Error(errorDetail);
      }

      const html = await response.text();
      const logoUrl = "/public/logo2.jpg";
      const modifiedHtml = html.replace(
        /<h1>(.*?)<\/h1>/i,
        `<h1 class="heading-with-logo"><img src="${logoUrl}" alt="Logo" class="logo" /> $1</h1>`
      );

      const fixedHtml = modifiedHtml.includes("<body>")
        ? modifiedHtml
            .replace("<body>", '<body><div class="report-container">')
            .replace(
              "</body>",
              `
          </div>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
  
            body {
              margin: 0;
              padding: 30px;
              background-color: #0047AB;
              font-family: 'Aptos Display', Arial, sans-serif;;
              color: #1F2937;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
  
            .heading-with-logo {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  
  .heading-with-logo .logo {
    width: 60px;
    height: 80px;
    object-fit: contain;
  }
  
  
            .report-container {
              max-width: 700px;
              margin: auto;
              background-color: #ffffff;
              border-radius: 20px;
              padding: 30px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              page-break-after: auto;
            }
  
            .report-container > * {
              break-inside: avoid;
              page-break-inside: avoid;
            }
  
            h1 {
              font-size: 2rem;
              text-align: center;
              color: #1D4ED8;
              margin-bottom: 20px;
            }
  
            h2 {
              font-size: 1.5rem;
              color: #111827;
              margin-top: 20px;
            }
  
            h3 {
              font-size: 1.25rem;
              margin-top: 16px;
              color: #374151;
            }
  
            p {
              margin: 16px 0;
              font-size: 1rem;
              color: #374151;
            }
  
            ul {
              margin-left: 1.5rem;
              margin-bottom: 12px;
            }
  
            li {
              margin-bottom: 6px;
            }
              
          </style>
        </body>`
            )
        : `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
  
            body {
              margin: 0;
              padding: 30px;
              background-color: #0047AB;
              font-family: 'Aptos Display', Arial, sans-serif;
              color: #1F2937;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
  
            .heading-with-logo {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  
  .heading-with-logo .logo {
    width: 60px;
    height: 80px;
    object-fit: contain;
  }
  
  
            .report-container {
              max-width: 700px;
              margin: auto;
              background-color: #ffffff;
              border-radius: 20px;
              padding: 30px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              page-break-after: auto;
            }
  
            .report-container > * {
              break-inside: avoid;
              page-break-inside: avoid;
            }
  
  
            h1 {
              font-size: 2rem;
              text-align: center;
              color: #1D4ED8;
              margin-bottom: 20px;
            }
  
            h2 {
              font-size: 1.5rem;
              color: #111827;
              margin-top: 20px;
            }
  
            h3 {
              font-size: 1.25rem;
              margin-top: 16px;
              color: #374151;
            }
  
            p {
              margin: 16px 0;
              font-size: 1rem;
              color: #374151;
            }
  
            ul {
              margin-left: 1.5rem;
              margin-bottom: 12px;
            }
  
            li {
              margin-bottom: 6px;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${modifiedHtml}
          </div>
        </body>
      </html>
      `;

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.left = "-9999px";
      iframe.style.width = "1000px";
      iframe.style.height = "1200px";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(fixedHtml);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const content = doc.body;

      await html2pdf()
        .set({
          margin: [0, 0],
          filename: `career_report_${userId}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Fix content cut
        })
        .from(content)
        .save();

      document.body.removeChild(iframe);
      toast.success("Report downloaded successfully.", { autoClose: 2000 });
    } catch (error) {
      console.error("Failed to download report:", error);
      let errorMessage = `Error downloading report: ${error.message}`;
      if (error.message.includes("CORS") || error.name === "TypeError") {
        errorMessage =
          "Network error: Unable to download report. Please check your internet connection and try again.";
      }
      toast.error(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  }

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

                {/* <button
                  onClick={downloadReport}
                  className="px-6 py-3 hover:bg-red-600 text-white text-base rounded-xl transition-all duration-200 flex items-center gap-2"
                  disabled={isGeneratingReport}
                >
                  <RiAiGenerate2 />
                  {isGeneratingReport
                    ? "Generating Report..."
                    : "Generate Report"}
                </button> */}

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    localStorage.removeItem("loginTime");
                    navigate("/auth/login");
                  }}
                  className="px-6 py-3 hover:bg-red-600 text-white text-base rounded-xl transition-all duration-200 flex items-center gap-2"
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
                      ? "bg-yellow-400 text-gray-700 rounded-br-none"
                      : "bg-yellow-200 text-gray-700 rounded-bl-none"
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
              <div className="p-3 rounded-lg max-w-[75%] text-sm bg-yellow-600 text-gray-100 rounded-bl-none">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
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
