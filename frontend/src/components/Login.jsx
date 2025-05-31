import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Welcome back!');
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303]">
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-[#f8f8f8] mb-2">EduPlatform</h1>
                        <p className="text-lg text-[#f8f8f8]/70">Welcome back!</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8 shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-[#f8f8f8] text-center">Sign In</h2>
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200 placeholder-[#f8f8f8]/50"
                                required
                            />
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200 placeholder-[#f8f8f8]/50"
                                required
                            />
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold bg-[#f8f8f8] text-[#030303] disabled:opacity-50 transition-all duration-200 hover:bg-[#f8f8f8]/90"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-[#030303] border-t-transparent rounded-full"></div>
                                        <span>Signing In...</span>
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </motion.button>
                            
                            <div className="text-center">
                                <Link to="/signup" className="text-[#f8f8f8]/70 hover:text-[#f8f8f8] transition-colors">
                                    New user? Create an account
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
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
                theme="dark"
                toastStyle={{
                    backgroundColor: '#222052',
                    color: '#f8f8f8',
                    border: '1px solid rgba(248, 248, 248, 0.2)'
                }}
            />
        </div>
    );
};

export default Login;