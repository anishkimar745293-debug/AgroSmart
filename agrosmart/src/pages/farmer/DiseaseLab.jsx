import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  AlertCircle,
  Loader2,
  Leaf,
  ArrowLeft,
  X,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiseaseLab = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto Grow Textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [description]);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const analyzeDisease = async () => {
    if (!image && !description.trim()) {
      return setError(
        "Please upload an image or enter symptoms."
      );
    }

    setError("");
    setLoading(true);

    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }

    if (description.trim()) {
      formData.append("description", description);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze-disease",
        // "https://agrosmart-ai-ajwt.onrender.com",
        // "https://agrosmart-ai-ajwt.onrender.com/api/analyze-disease",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data.advice);
      } else {
        setError(
          data.message ||
            "Failed to get disease analysis."
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Cannot connect to server. Ensure backend is running."
      );
    }

    setLoading(false);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-green-50 via-white to-green-100 flex flex-col">

      {/* Header */}
      <div className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-10">

        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

          <button
            onClick={() => navigate("//farmer/dashboard")}
            className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <Leaf
              size={24}
              className="text-green-600"
            />
            <h1 className="font-bold text-xl text-gray-800">
              Disease Detection Lab
            </h1>
          </div>

          <div className="w-20"></div>

        </div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">

        <div className="max-w-5xl mx-auto px-4 py-6">

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center mt-20">

              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <Leaf
                  size={48}
                  className="text-green-600"
                />
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                Crop Disease Assistant
              </h2>

              <p className="text-gray-600 mt-3 max-w-xl">
                Upload an image or describe crop symptoms
                to identify diseases and receive treatment
                recommendations.
              </p>

            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-100">

              <div className="flex items-center gap-3 text-green-700">

                <Loader2
                  size={22}
                  className="animate-spin"
                />

                <span className="font-medium">
                  Analyzing crop disease...
                </span>

              </div>

            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-600">

              <AlertCircle size={20} />

              <span>{error}</span>

            </div>
          )}

          {result && (
            <div className="bg-white border border-green-100 rounded-3xl shadow-xl overflow-hidden">

              <div className="bg-green-600 text-white px-6 py-4 font-semibold text-lg">
                Diagnosis & Remedy
              </div>

              <div className="p-6">

                <div className="whitespace-pre-wrap text-gray-700 leading-8">
                  {result}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Bottom Input Area */}
      <div className="border-t bg-white/95 backdrop-blur-md">

        <div className="max-w-5xl mx-auto p-4">

          {/* Image Preview */}
          {preview && (
            <div className="mb-3">

              <div className="relative inline-block">

                <img
                  src={preview}
                  alt="preview"
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-green-200"
                />

                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>

              </div>

            </div>
          )}

          {/* Input Box */}
          <div className="bg-white border-2 border-green-200 rounded-3xl shadow-lg overflow-hidden">

            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your crop problem..."
              className="w-full resize-none px-5 py-4 outline-none text-gray-700 min-h-[52px] max-h-[220px] overflow-y-auto"
            />

            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">

              <label className="flex items-center gap-2 cursor-pointer text-green-700 hover:text-green-900 font-medium">

                <Upload size={18} />

                <span>Upload Image</span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              <button
                onClick={analyzeDisease}
                disabled={loading}
                className="w-11 h-11 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition disabled:bg-gray-400"
              >
                {loading ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>

            </div>

          </div>

          <p className="text-center text-xs text-gray-500 mt-2">
            Upload crop image or enter symptoms for AI
            disease detection.
          </p>

        </div>

      </div>

    </div>
  );
};

export default DiseaseLab;

