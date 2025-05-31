import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        language: 'Hindi'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const languages = ['Hindi', 'Marathi', 'Kannada', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'English'];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_NODE_BASE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    language: formData.language
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Account created successfully!');
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                toast.error(data.message || 'Signup failed');
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#021526]">
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
                        <h1 className="text-4xl font-bold text-[#E2E2B6] mb-2">EduPlatform</h1>
                        <p className="text-lg text-[#6EACDA]">Join us today</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-[#03346E] border border-[#6EACDA] rounded-2xl p-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-[#E2E2B6] text-center">Create Account</h2>
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#021526] text-[#E2E2B6] border border-[#6EACDA] focus:ring-2 focus:ring-[#6EACDA] focus:outline-none transition-all duration-200"
                                required
                            />
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#021526] text-[#E2E2B6] border border-[#6EACDA] focus:ring-2 focus:ring-[#6EACDA] focus:outline-none transition-all duration-200"
                                required
                            />
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#021526] text-[#E2E2B6] border border-[#6EACDA] focus:ring-2 focus:ring-[#6EACDA] focus:outline-none transition-all duration-200"
                                required
                            />
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#021526] text-[#E2E2B6] border border-[#6EACDA] focus:ring-2 focus:ring-[#6EACDA] focus:outline-none transition-all duration-200"
                                required
                            />
                            
                            <motion.select
                                whileFocus={{ scale: 1.02 }}
                                value={formData.language}
                                onChange={(e) => setFormData({...formData, language: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#021526] text-[#E2E2B6] border border-[#6EACDA] focus:ring-2 focus:ring-[#6EACDA] focus:outline-none transition-all duration-200"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang} className="bg-[#021526]">{lang}</option>
                                ))}
                            </motion.select>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold bg-[#E2E2B6] text-[#021526] disabled:opacity-50 transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-[#021526] border-t-transparent rounded-full"></div>
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </motion.button>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-[#6EACDA] hover:opacity-80 transition-opacity">
                                    Already have an account? Sign in
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
            />
        </div>
    );
};

export default Signup;