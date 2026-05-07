'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const result = await login({ email, password });

  if (result.success) {
    // Check for pending invite first
    const pendingInvite = localStorage.getItem('pendingInvite');
    if (pendingInvite) {
      window.location.href = `/invite/${pendingInvite}`;
      return;
    }

    // Check for redirect param in URL
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      window.location.href = redirect;
      return;
    }

    // Default redirect
    window.location.href = '/boards';
  } else {
    setError(result.message || 'Login failed');
  }
};


  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Section - Accent */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-indigo-500 to-indigo-600 flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [20, 0, 20], x: [-10, 0, -10] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm" />
            </div>
            <span className="text-white font-bold text-xl">BoardFlow</span>
          </div>

          <motion.div variants={container} initial="hidden" animate="show">
            <motion.h1 variants={item} className="text-white text-5xl font-bold leading-tight mb-6">
              Collaborate & Create
            </motion.h1>
            <motion.p variants={item} className="text-indigo-100 text-lg leading-relaxed">
              Bring your ideas to life with an intuitive whiteboard platform designed for modern teams.
            </motion.p>
          </motion.div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 space-y-6">
          {[
            { icon: '✓', title: 'Real-time Collaboration', desc: 'Work together seamlessly' },
            { icon: '✓', title: 'Infinite Canvas', desc: 'Unlimited creative space' },
            { icon: '✓', title: 'Smart Tools', desc: 'Built for productivity' },
          ].map((feature, i) => (
            <motion.div key={i} variants={item} className="flex gap-4 items-start">
              <div className="text-indigo-300 text-2xl mt-1">{feature.icon}</div>
              <div>
                <p className="text-white font-semibold">{feature.title}</p>
                <p className="text-indigo-100 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Section - Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
      >
        <div className="w-full max-w-md">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue collaborating</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <motion.div variants={item}>
                <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="w-full pl-12 pr-12 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:bg-primary/50 transition-all flex items-center justify-center gap-2 mt-8"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.p variants={item} className="text-center text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Create one
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
