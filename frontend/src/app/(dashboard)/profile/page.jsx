"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import useAuthStore from "@/store/authStore";

export default function ProfilePage() {
	const { user, updateProfile, updatePassword, isLoading } = useAuthStore();
	const [name, setName] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [profileMessage, setProfileMessage] = useState(null);
	const [passwordMessage, setPasswordMessage] = useState(null);

	useEffect(() => {
		setName(user?.name || "");
	}, [user]);

	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		setProfileMessage(null);

		if (!name.trim()) {
			setProfileMessage({ type: "error", text: "Name is required." });
			return;
		}

		const res = await updateProfile({ name: name.trim() });
		if (res.success) {
			setProfileMessage({ type: "success", text: "Profile updated successfully." });
		} else {
			setProfileMessage({ type: "error", text: res.message || "Failed to update profile." });
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setPasswordMessage(null);

		if (!currentPassword || !newPassword) {
			setPasswordMessage({ type: "error", text: "Please fill in all password fields." });
			return;
		}

		if (newPassword.length < 6) {
			setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordMessage({ type: "error", text: "New passwords do not match." });
			return;
		}

		const res = await updatePassword({
			currentPassword,
			newPassword,
		});

		if (res.success) {
			setPasswordMessage({ type: "success", text: "Password updated successfully." });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} else {
			setPasswordMessage({ type: "error", text: res.message || "Failed to update password." });
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="mb-8"
			>
				<h1 className="text-2xl font-semibold text-[#111827]">Profile</h1>
				<p className="mt-2 text-sm text-[#6B7280]">
					Manage your personal details and keep your account secure.
				</p>
			</motion.div>

			<div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
				<Card className="border border-[#E5E7EB] shadow-sm">
					<CardHeader className="space-y-2">
						<div className="flex items-center gap-2 text-[#4F46E5]">
							<UserRound className="h-5 w-5" />
							<CardTitle>Profile details</CardTitle>
						</div>
						<CardDescription>
							Update your display name and review your account email.
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleProfileSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Full name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="border-[#E5E7EB] focus:border-[#4F46E5]"
									placeholder="Enter your name"
								/>
							</div>

							<div className="space-y-2 pb-6">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									value={user?.email || ""}
									disabled
									className="border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]"
								/>
							</div>

							{profileMessage && (
								<div
									className={`rounded-lg border px-3 py-2 text-sm ${
										profileMessage.type === "success"
											? "border-green-200 bg-green-50 text-green-700"
											: "border-red-200 bg-red-50 text-red-600"
									}`}
								>
									{profileMessage.text}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex items-center justify-between">
							<span className="text-xs text-[#9CA3AF]">Changes update immediately.</span>
							<Button type="submit" disabled={isLoading}>
								Save changes
							</Button>
						</CardFooter>
					</form>
				</Card>

				<Card className="border border-[#E5E7EB] shadow-sm">
					<CardHeader className="space-y-2">
						<div className="flex items-center gap-2 text-[#4F46E5]">
							<ShieldCheck className="h-5 w-5" />
							<CardTitle>Password & security</CardTitle>
						</div>
						<CardDescription>
							Change your password to keep your account protected.
						</CardDescription>
					</CardHeader>
					<form onSubmit={handlePasswordSubmit}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="current-password">Current password</Label>
								<Input
									id="current-password"
									type="password"
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									className="border-[#E5E7EB] focus:border-[#4F46E5]"
									placeholder="Enter current password"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="new-password">New password</Label>
								<Input
									id="new-password"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="border-[#E5E7EB] focus:border-[#4F46E5]"
									placeholder="Enter new password"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirm-password">Confirm new password</Label>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="border-[#E5E7EB] focus:border-[#4F46E5]"
									placeholder="Re-enter new password"
								/>
							</div>

							{passwordMessage && (
								<div
									className={`rounded-lg border px-3 py-2 text-sm ${
										passwordMessage.type === "success"
											? "border-green-200 bg-green-50 text-green-700"
											: "border-red-200 bg-red-50 text-red-600"
									}`}
								>
									{passwordMessage.text}
								</div>
							)}
						</CardContent>
						<CardFooter className="flex items-center justify-between">
							<span className="text-xs text-[#9CA3AF]">Minimum 6 characters.</span>
							<Button type="submit" disabled={isLoading}>
								Update password
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
