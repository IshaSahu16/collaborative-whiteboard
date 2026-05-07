"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Monitor,
  Upload,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Real-time collaboration",
    description:
      "Work together with your team in real-time. See changes as they happen.",
  },
  {
    icon: Monitor,
    title: "Infinite canvas",
    description:
      "Never run out of space. Expand your ideas on an infinite digital canvas.",
  },
  {
    icon: Upload,
    title: "Easy export",
    description: "Export your boards as PNG or PDF. Share your work anywhere.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      {/* Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-8 h-8 bg-[#4F46E5] rounded-lg"
            >
              <LayoutDashboard className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-semibold text-[#111827]">
              CollabCanvas
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#374151]">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA]">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-[#111827] leading-tight text-balance"
          >
            Collaborate visually with your team in real-time
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-[#6B7280] text-balance"
          >
            CollabCanvas is a collaborative whiteboard platform that helps teams
            brainstorm, plan, and create together. No matter where you are.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link href="/boards">
              <Button size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA] gap-2">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn more
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features preview */}
        <motion.div
          id="features"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-[#E5E7EB] h-full">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 flex items-center justify-center bg-[#EEF2FF] rounded-lg"
                  >
                    <feature.icon className="w-5 h-5 text-[#4F46E5]" />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-semibold text-[#111827]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#6B7280]">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
