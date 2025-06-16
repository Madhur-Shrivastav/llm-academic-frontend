import { useState } from "react";
import { FaRegFileAlt, FaRegBookmark } from "react-icons/fa";
import { RiAiGenerate2 } from "react-icons/ri";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Sidebar = () => {
  const [selectedModel, setSelectedModel] = useState("TrueYou Careers");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const downloadReport = async () => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = JSON.parse(storedUser);

    const userId = parsedUser.id;
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
          // Add authorization headers if your endpoint is protected
          // headers: {
          //   'Authorization': `Bearer ${localStorage.getItem("token")}`, // Example if token is needed
          // },
        }
      );

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          // Not a JSON error response, or failed to parse
          console.log("Failed to parse error response:", e);
        }
        throw new Error(errorDetail);
      }

      const blob = await response.blob();
      const filenameHeader = response.headers.get("Content-Disposition");
      let filename = `career_report_${userId}.pdf`; // Default filename

      if (filenameHeader) {
        const parts = filenameHeader.split("filename=");
        if (parts.length > 1) {
          filename = parts[1].replace(/"/g, ""); // Remove quotes if present
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("Report downloaded successfully."); // Or use a more subtle notification
    } catch (error) {
      console.error("Failed to download report:", error);
      let errorMessage = `Error downloading report: ${error.message}`;
      if (error.message.includes("CORS") || error.name === "TypeError") {
        errorMessage =
          "Network error: Unable to download report. Please check your internet connection and try again.";
      }
      alert(errorMessage);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const models = [
    {
      name: "TrueYou Careers",
      icon: (
        <img
          className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold"
          src="/public/logo.jpg"
        ></img>
      ),
    },
    {
      name: "Library",
      icon: <FaRegBookmark className="w-6 h-6 text-gray-400" />,
      count: 20,
    },
    {
      name: "Generate Report",
      icon: <RiAiGenerate2 className="w-6 h-6 text-gray-400" />,
    },
  ];

  const today = [];

  const yesterday = [];

  return (
    <div
      className={`${
        isCollapsed ? "-translate-x-[20] " : "translate-x-0"
      }  relative z-40 top-0 left-0 h-full bg-gray-900 text-white flex flex-col transition-transform duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } border-r border-gray-700 overflow-y-auto`}
    >
      <div className="flex flex-col flex-1 p-3">
        <div className="flex items-center py-4 px-2  relative">
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full cursor-pointer font-bold">
              <span>{selectedModel}</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-2 top-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 shadow-md"
          >
            {isCollapsed ? (
              <IoChevronForward className="text-white w-4 h-4" />
            ) : (
              <IoChevronBack className="text-white w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {models.map((model) => (
            <div
              key={model.name}
              className={`flex items-center p-2 rounded transition-colors ${
                selectedModel === model.name && model.name !== "Generate Report"
                  ? "bg-gray-800"
                  : "hover:bg-gray-800"
              } ${
                model.name === "Generate Report" && isGeneratingReport
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
              onClick={() => {
                if (model.name === "Generate Report") {
                  if (!isGeneratingReport) {
                    downloadReport();
                  }
                } else {
                  setSelectedModel(model.name);
                }
              }}
            >
              {model.icon}
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 ml-2">
                  <span className="text-sm">
                    {model.name === "Generate Report" && isGeneratingReport
                      ? "Generating Report..."
                      : model.name}
                  </span>
                  {model.count && (
                    <span className="bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {model.count}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!isCollapsed && (
          <>
            <div className="mt-6">
              <h3 className="text-xs text-gray-400 mb-2 px-2">Today</h3>
              <ul>
                {today.map((item, index) => (
                  <li
                    key={`today-${index}`}
                    className="flex items-center px-2 py-2 rounded cursor-pointer hover:bg-gray-800 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    <FaRegFileAlt className="mr-2 text-sm text-gray-400" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xs text-gray-400 mb-2 px-2">Yesterday</h3>
              <ul>
                {yesterday.map((item, index) => (
                  <li
                    key={`yesterday-${index}`}
                    className="flex items-center px-2 py-2 rounded cursor-pointer hover:bg-gray-800 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    <FaRegFileAlt className="mr-2 text-sm text-gray-400" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
