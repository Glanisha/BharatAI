import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";

const languages = [
  "Hindi",
  "Marathi",
  "Kannada",
  "Bengali",
  "Tamil",
  "Telugu",
  "Gujarati",
  "English",
];
const roles = [
  { value: "student", label: "👨‍🎓 Student" },
  { value: "teacher", label: "👨‍🏫 Teacher" },
];

const Signup = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    language: "Hindi",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "teacher") {
      navigate("/teacher-dashboard");
    } else if (token && role === "student") {
      navigate("/student-dashboard");
    }
  }, [navigate]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error("Please fill in all fields");
        return;
      }
    }
    if (step === 2) {
      if (
        !formData.password ||
        !formData.confirmPassword ||
        formData.password.length < 6
      ) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            language: formData.language,
            role: formData.role,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        toast.success("Account created successfully!");
        if (data.user.role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (data.user.role === "student") {
          navigate("/student-dashboard");
        }
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form Steps
  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <h2
            className={`text-xl font-semibold text-center mb-4 ${
              isDark ? "text-[#f8f8f8]" : "text-[#222052]"
            }`}
          >
            Create Account
          </h2>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`
              w-full px-4 py-3 rounded-xl border text-sm mb-3
              ${
                isDark
                  ? "bg-[#080808] text-[#f8f8f8] border-[#23234a] placeholder-[#f8f8f8]/40"
                  : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb] placeholder-[#222052]/40"
              }
              focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
            `}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`
              w-full px-4 py-3 rounded-xl border text-sm
              ${
                isDark
                  ? "bg-[#080808] text-[#f8f8f8] border-[#23234a] placeholder-[#f8f8f8]/40"
                  : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb] placeholder-[#222052]/40"
              }
              focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
            `}
            required
          />
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <h2
            className={`text-xl font-semibold text-center mb-4 ${
              isDark ? "text-[#f8f8f8]" : "text-[#222052]"
            }`}
          >
            Set Password
          </h2>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={`
              w-full px-4 py-3 rounded-xl border text-sm mb-3
              ${
                isDark
                  ? "bg-[#080808] text-[#f8f8f8] border-[#23234a] placeholder-[#f8f8f8]/40"
                  : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb] placeholder-[#222052]/40"
              }
              focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
            `}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={`
              w-full px-4 py-3 rounded-xl border text-sm
              ${
                isDark
                  ? "bg-[#080808] text-[#f8f8f8] border-[#23234a] placeholder-[#f8f8f8]/40"
                  : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb] placeholder-[#222052]/40"
              }
              focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
            `}
            required
          />
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <h2
            className={`text-xl font-semibold text-center mb-4 ${
              isDark ? "text-[#f8f8f8]" : "text-[#222052]"
            }`}
          >
            Preferences
          </h2>
          <div className="mb-3">
            <label
              className={`block mb-1 text-sm font-medium ${
                isDark ? "text-[#f8f8f8]" : "text-[#222052]"
              }`}
            >
              Preferred Language
            </label>
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value })
              }
              className={`
                w-full px-4 py-3 rounded-xl border text-sm
                ${
                  isDark
                    ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                    : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb]"
                }
                focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
              `}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className={`block mb-1 text-sm font-medium ${
                isDark ? "text-[#f8f8f8]" : "text-[#222052]"
              }`}
            >
              Select Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className={`
                w-full px-4 py-3 rounded-xl border text-sm
                ${
                  isDark
                    ? "bg-[#080808] text-[#f8f8f8] border-[#23234a]"
                    : "bg-[#f8f8f8] text-[#222052] border-[#e5e7eb]"
                }
                focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200
              `}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex items-center justify-center ${
        isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
      }`}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-row items-center justify-center gap-3 mb-4">
          <img
            src="/logo.png"
            alt="E-Gurukul Logo"
            className="w-10 h-10 rounded-lg"
          />
          <h1
            className={`text-xl font-bold ${
              isDark ? "text-[#f8f8f8]" : "text-[#222052]"
            }`}
          >
            E-Gurukul
          </h1>
        </div>
        <div
          className={`
            ${
              isDark
                ? "bg-[#181818] border border-[#23234a]"
                : "bg-white border border-[#e5e7eb]"
            }
            rounded-2xl p-8 shadow-xl transition-all duration-200
          `}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 3) {
                handleNext();
              } else {
                handleSubmit(e);
              }
            }}
            className="space-y-4"
          >
            {renderStep()}
            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isDark
                      ? "bg-[#23234a] text-[#f8f8f8] hover:bg-[#18182b]"
                      : "bg-[#ece9ff] text-[#222052] hover:bg-[#e0e7ff]"
                  }`}
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="submit"
                  className={`ml-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isDark
                      ? "bg-[#4a4494] text-[#f8f8f8] hover:bg-[#3d3a7a]"
                      : "bg-[#222052] text-[#f8f8f8] hover:bg-[#1a1840]"
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isDark
                      ? "bg-[#4a4494] text-[#f8f8f8] hover:bg-[#3d3a7a]"
                      : "bg-[#222052] text-[#f8f8f8] hover:bg-[#1a1840]"
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-[#f8f8f8] border-t-transparent rounded-full"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
            <div className="text-center mt-4">
              <Link
                to="/login"
                className={`underline underline-offset-2 ${
                  isDark
                    ? "text-[#a78bfa] hover:text-[#f8f8f8]"
                    : "text-[#7c3aed] hover:text-[#222052]"
                } transition-colors`}
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
        toastStyle={{
          backgroundColor: isDark ? "#222052" : "#ece9ff",
          color: isDark ? "#f8f8f8" : "#222052",
          border: isDark ? "1px solid #23234a" : "1px solid #e5e7eb",
        }}
      />
    </div>
  );
};

export default Signup;
