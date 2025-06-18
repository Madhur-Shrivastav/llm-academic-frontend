import { useState } from "react";
import { FaRegFileAlt, FaRegBookmark } from "react-icons/fa";
import { RiAiGenerate2 } from "react-icons/ri";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

const Sidebar = () => {
  const [selectedModel, setSelectedModel] = useState("TrueYou Careers");
  const [isCollapsed, setIsCollapsed] = useState(true);
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
      console.log(html);
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
