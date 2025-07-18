import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2pdf from "html2pdf.js";

const Result_10 = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem("llm_profile");
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
      } else {
        setError("No profile data found. Please complete the questionnaire.");
      }
    } catch (e) {
      console.error("Failed to parse profile data from session storage", e);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins">
        <p className="text-xl text-gray-700">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-md max-w-md text-center">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-poppins">
        <p className="text-xl text-gray-700">No profile data available.</p>
      </div>
    );
  }

  const {
    potential_career_paths,
    welcome_statement,
    your_natural_inclination,
    your_strengths_and_qualities,
    possible_roadblocks,
    final_note,
    profile_in_a_gist,
    profile_summary,
  } = profileData;

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
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-white pt-12 md:pt-24 pb-12 font-poppins px-5 sm:px-8 lg:px-16">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-md md:max-w-3xl w-full mx-auto">
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo.jpg"
            alt="TrueYou logo"
            className="h-48 sm:h-56 md:h-64 object-contain"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-10 tracking-wide text-center underline">
          Your Career Report Overview
        </h1>

        <div className="space-y-8 mb-12">
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <p className="text-gray-900 text-lg sm:text-[25px] font-bold flex flex-col leading-tight">
              <span className="font-bold text-yellow-600">
                Hi! {JSON.parse(localStorage.getItem("user")).full_name}
                {", "}
              </span>
              <span className="font-semibold text-yellow-600">
                {welcome_statement}
              </span>
            </p>
          </div>

          <div className="bg-teal-50 rounded-xl p-6 border border-teal-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <h3 className="text-[30px] font-bold text-teal-700">
              Your Natural Inclination:
            </h3>
            <span className="text-gray-800 text-base sm:text-[23px] leading-tight">
              {your_natural_inclination}
            </span>
          </div>

          {potential_career_paths && potential_career_paths.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[30px] font-bold text-green-700 mb-3">
                Potential Career Options:
              </h3>
              <div className="flex flex-wrap gap-2">
                {potential_career_paths.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-[20px]"
                  >
                    {keyword.path}
                  </span>
                ))}
              </div>
            </div>
          )}

          {your_strengths_and_qualities && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[30px] font-bold text-purple-700 mb-3">
                Strengths and Qualities:
              </h3>

              <ul className="list-disc list-inside text-gray-800 space-y-2">
                {your_strengths_and_qualities.map((strength, index) => (
                  <li key={index} className="text-base sm:text-[23px]">
                    <span className="capitalize">{strength}</span>{" "}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {possible_roadblocks && possible_roadblocks.length > 0 && (
            <div className="bg-rose-50 rounded-xl p-6 border border-rose-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[30px] font-bold text-rose-700 mb-3">
                Possible Roadblocks:
              </h3>
              <ul className="list-disc list-inside text-gray-800 space-y-2">
                {possible_roadblocks.map((step, index) => (
                  <li key={index} className="text-base sm:text-[23px]">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <h3 className="text-xl font-semibold text-yellow-700 mb-3">
              Profile Summary:
            </h3>
            <span className="text-gray-800 text-base sm:text-lg leading-relaxed">
              {profile_summary}
            </span>
          </div> */}

          {profile_in_a_gist && (
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
              <h3 className="text-[34px] font-bold text-indigo-700 mb-3 text-center underline">
                Report Summary
              </h3>
              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Subjects you are good at:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {profile_in_a_gist.subjects_good_at.map((subject, index) => (
                    <li key={index}>{subject}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Natural Calling:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  <li>{profile_in_a_gist.natural_calling}</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Naturally inclined to pursue:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {profile_in_a_gist.inclined_to_pursue.map(
                    (inclination, index) => (
                      <li key={index}>{inclination}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                  Roadblocks:
                </h4>
                <ul className="list-disc list-inside text-gray-800 space-y-1 text-[22px]">
                  {profile_in_a_gist.roadblocks.map((roadblock, index) => (
                    <li key={index}>{roadblock}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-gray-800 text-base sm:text-[22px] leading-relaxed">
                  <strong className="text-[26.5px] font-semibold text-indigo-600 mb-2 underline">
                    Encouragement:
                  </strong>{" "}
                  {profile_in_a_gist.encouragement}
                </p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-default">
            <h3 className="text-[30px] font-semibold text-yellow-700">
              Final Note:
            </h3>
            <span className="text-gray-800 text-base sm:text-[23px] leading-relaxed">
              {final_note}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300 cursor-default mt-2 mb-5">
            <h3 className="text-[30px] font-semibold mb-1">
              📞 Confusion हटाओ, Clarity लाओ
            </h3>
            <p className="text-[24px] mb-2">
              Talk to our{" "}
              <span className="font-medium">Academic Counseling Expert</span>
            </p>
            <p className="text-[24px] font-semibold">
              Call us at:{" "}
              <a
                href="tel:7454848040"
                className="text-blue-600 hover:underline"
              >
                7454848040
              </a>
            </p>
          </div>
        </div>

        <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center">
          Still have questions or want to explore more?{" "}
          <Link to="/chat" className="font-semibold text-yellow-600">
            Just continue to ask.
          </Link>
        </p>

        <div className="mt-8 text-center">
          <button
            disabled={isGeneratingReport}
            onClick={downloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-[22px]"
          >
            {isGeneratingReport ? "Downloading..." : "Download Final Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result_10;
