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
        language: 'Hindi',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const languages = ['Hindi', 'Marathi', 'Kannada', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'English'];
    const roles = [
        { value: 'student', label: '👨‍🎓 Student' },
        { value: 'teacher', label: '👨‍🏫 Teacher' }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        // Redirect to dashboard if user is already logged in
        if (token && role === 'teacher') {
            navigate('/teacher-dashboard');
        } else if (token && role === 'student') {
            navigate('/student-dashboard'); 
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
                    language: formData.language,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role); // Store user role
                toast.success('Account created successfully! Welcome aboard!');
                // Redirect based on user role
                if (data.user.role === 'teacher') {
                    navigate('/teacher-dashboard');
                } else if (data.user.role === 'student') {
                    navigate('/student-dashboard');
                } else {
                    toast.error('Invalid user role');
                    return;
                }
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
                        <p className="text-lg text-[#f8f8f8]/70">Join us today</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-[#222052] border border-[#f8f8f8]/20 rounded-2xl p-8 shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-[#f8f8f8] text-center">Create Account</h2>
                            
                            {/* Role Selection */}
                            <motion.div whileFocus={{ scale: 1.02 }}>
                                <label className="block text-[#f8f8f8] mb-2 text-sm font-medium">Select Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200"
                                    required
                                >
                                    {roles.map(role => (
                                        <option key={role.value} value={role.value} className="bg-[#030303]">
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </motion.div>
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200 placeholder-[#f8f8f8]/50"
                                required
                            />
                            
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
                            
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200 placeholder-[#f8f8f8]/50"
                                required
                            />
                            
                            <motion.div whileFocus={{ scale: 1.02 }}>
                                <label className="block text-[#f8f8f8] mb-2 text-sm font-medium">Preferred Language</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-[#030303] text-[#f8f8f8] border border-[#f8f8f8]/30 focus:ring-2 focus:ring-[#f8f8f8]/50 focus:outline-none transition-all duration-200"
                                >
                                    {languages.map(lang => (
                                        <option key={lang} value={lang} className="bg-[#030303]">{lang}</option>
                                    ))}
                                </select>
                            </motion.div>
                            
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
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </motion.button>
                            
                            <div className="text-center">
                                <Link to="/login" className="text-[#f8f8f8]/70 hover:text-[#f8f8f8] transition-colors">
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
                toastStyle={{
                    backgroundColor: '#222052',
                    color: '#f8f8f8',
                    border: '1px solid rgba(248, 248, 248, 0.2)'
                }}
            />
        </div>
    );
};

export default Signup;