
import React, { useState } from "react";
import {
  Sprout,
  Loader2,
  ArrowLeft,
  MapPin,
  LandPlot,
  IndianRupee,
  Leaf,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CropAdvisoryPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    state: "",
    soilType: "",
    landSize: "",
    budget: "",
  });

  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAIAdvice = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setAiAdvice("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/crop-advisory",
        // "https://agrosmart-ai-ajwt.onrender.com",
        // "https://agrosmart-ai-ajwt.onrender.com/api/crop-advisory"/
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAiAdvice(data.advice);
      } else {
        setError(data.message || "Failed to get recommendations.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to AI server.");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-green-50 via-white to-green-100">

      {/* Header */}
      <div className="h-16 flex items-center px-4 md:px-8 border-b border-green-100 bg-white/40 backdrop-blur-md">

        <button
          onClick={() => navigate("/farmer/dashboard")}
          className="flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-64px)] p-4 md:p-6 overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0">

          {/* LEFT FORM */}
          <div className="lg:col-span-4 h-full min-h-0">

            <div className="bg-white/80 backdrop-blur-xl border border-green-100 rounded-3xl shadow-xl p-6 h-full overflow-y-auto">

              <div className="text-center mb-6">

                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center shadow">
                  <Sprout size={40} className="text-green-600" />
                </div>

                <h1 className="mt-4 text-2xl font-bold text-gray-800">
                  AI Crop Advisory
                </h1>

                <p className="text-gray-500 text-sm mt-2">
                  Get personalized crop recommendations for your farm.
                </p>

              </div>

              <form
                onSubmit={getAIAdvice}
                className="space-y-4"
              >

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State / Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          state: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Soil Type
                  </label>

                  <select
                    required
                    value={formData.soilType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        soilType: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select Soil Type</option>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Clay Soil">Clay Soil</option>
                    <option value="Sandy Soil">Sandy Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Land Size (Acres)
                  </label>

                  <div className="relative">
                    <LandPlot
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={formData.landSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          landSize: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Budget (₹)
                  </label>

                  <div className="relative">
                    <IndianRupee
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budget: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="animate-spin"
                        size={20}
                      />
                      AI is Thinking...
                    </>
                  ) : (
                    <>
                      <Leaf size={20} />
                      Get Recommendations
                    </>
                  )}
                </button>

              </form>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
                  {error}
                </div>
              )}

            </div>

          </div>

          {/* RIGHT OUTPUT */}
          <div className="lg:col-span-8 h-full min-h-0">

            <div className="bg-white/80 backdrop-blur-xl border border-green-100 rounded-3xl shadow-xl h-full overflow-y-auto">

              {!loading && !aiAdvice && (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">

                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5">
                    <Sprout
                      size={50}
                      className="text-green-600"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800">
                    Crop Recommendation Report
                  </h2>

                  <p className="text-gray-500 mt-3 max-w-md">
                    Fill the form on the left and AgroSmart AI
                    will generate crop recommendations.
                  </p>

                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col justify-center items-center">

                  <Loader2
                    size={60}
                    className="animate-spin text-green-600"
                  />

                  <p className="mt-4 text-gray-600 font-medium">
                    Generating Recommendations...
                  </p>

                </div>
              )}

              {aiAdvice && (
                <div className="p-8">

                  <h2 className="text-3xl font-bold text-green-700 mb-6">
                    🌱 Crop Recommendations
                  </h2>

                  <div className="whitespace-pre-wrap text-gray-700 leading-8">
                    {aiAdvice}
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CropAdvisoryPage;