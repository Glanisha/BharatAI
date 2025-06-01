import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_BASE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);
        toast.success("Welcome back!");
        if (data.user.role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (data.user.role === "student") {
          navigate("/student-dashboard");
        } else {
          toast.error("Invalid user role");
          return;
        }
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#080808]" : "bg-[#f8f8f8]"
      }`}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-row items-center justify-center gap-4 mb-6">
            <img
              src="/logo.png"
              alt="E-Gurukul Logo"
              className="w-10 h-10 rounded-lg"
            />
            <h1
              className={`text-2xl font-bold tracking-wide ${
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2
                className={`text-xl font-semibold text-center mb-2 ${
                  isDark ? "text-[#f8f8f8]" : "text-[#222052]"
                }`}
              >
                Sign In
              </h2>
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
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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
              <button
                type="submit"
                disabled={loading}
                className={`
                                    w-full py-3 rounded-xl font-semibold transition-all duration-200
                                    ${
                                      isDark
                                        ? "bg-[#4a4494] text-[#f8f8f8] hover:bg-[#3d3a7a]"
                                        : "bg-[#222052] text-[#f8f8f8] hover:bg-[#1a1840]"
                                    }
                                    disabled:opacity-50
                                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-[#f8f8f8] border-t-transparent rounded-full"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
              <div className="text-center">
                <Link
                  to="/signup"
                  className={`
                                        underline underline-offset-2
                                        ${
                                          isDark
                                            ? "text-[#a78bfa] hover:text-[#f8f8f8]"
                                            : "text-[#7c3aed] hover:text-[#222052]"
                                        }
                                        transition-colors
                                    `}
                >
                  New user? Create an account
                </Link>
              </div>
            </form>
          </div>
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

export default Login;
