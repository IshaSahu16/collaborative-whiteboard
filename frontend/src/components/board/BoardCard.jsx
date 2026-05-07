"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoreVertical, Clock, Edit3, Copy, Trash2, Star, Share2, Link2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const hexToColorKey = {
  "#4F46E5": "indigo",
  "#2563EB": "blue",
  "#059669": "green",
  "#EA580C": "orange",
  "#DB2777": "pink",
  "#7C3AED": "purple",
};

const colors = {
  indigo: "bg-[#EEF2FF]",
  blue: "bg-[#EFF6FF]",
  green: "bg-[#ECFDF5]",
  orange: "bg-[#FFF7ED]",
  pink: "bg-[#FDF2F8]",
  purple: "bg-[#F5F3FF]",
};

const accentColors = {
  indigo: "bg-[#4F46E5]",
  blue: "bg-[#2563EB]",
  green: "bg-[#059669]",
  orange: "bg-[#EA580C]",
  pink: "bg-[#DB2777]",
  purple: "bg-[#7C3AED]",
};

function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function BoardCard({
  board,
  onRename,
  onDuplicate,
  onDelete,
  onShareLink, onInviteEmail,
  index = 0,
}) {
  const [isStarred, setIsStarred] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const colorKey = hexToColorKey[board.thumbnail] || "indigo";

  const displayedMembers = board.members?.slice(0, 3) || [];
  const remainingCount = (board.membersCount || 0) - 3;

    const handleShareLink = () => {
    onShareLink?.(board);
    setIsShareOpen(false);
  };

  const handleInviteEmail = () => {
    onInviteEmail?.(board);
    setIsShareOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md hover:border-[#D1D5DB]">
        {/* Preview area */}
        <Link href={`/board/${board.id}`}>
          <div className={`relative h-36 ${colors[colorKey]} p-4`}>
            <div className="absolute inset-4 border-2 border-dashed border-black/5 rounded-lg" />
            <div
              className={`absolute top-6 left-6 w-16 h-2 ${accentColors[colorKey]} rounded opacity-40`}
            />
            <div
              className={`absolute top-10 left-6 w-24 h-2 ${accentColors[colorKey]} rounded opacity-25`}
            />
            <div
              className={`absolute bottom-6 right-6 w-12 h-12 ${accentColors[colorKey]} rounded-lg opacity-20`}
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setIsStarred(!isStarred);
              }}
              className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Star
                className={`h-5 w-5 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-[#6B7280]"}`}
              />
            </motion.button>
          </div>
        </Link>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/board/${board.id}`}
              className="flex-1 min-w-0 hover:text-[#4F46E5] transition-colors"
            >
              <h3 className="font-medium text-[#111827] truncate">
                {board.title}
              </h3>
            </Link>

            {/* Menu */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {/* Mobile quick actions (no hover on touch) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:hidden"
                onClick={handleShareLink}
                title="Share by Link"
              >
                <Link2 className="h-4 w-4 text-[#9CA3AF]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:hidden"
                onClick={handleInviteEmail}
                title="Invite by Email"
              >
                <Mail className="h-4 w-4 text-[#9CA3AF]" />
              </Button>

              {/* Desktop share menu */}
              <DropdownMenu open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-8 w-8 sm:inline-flex"
                  >
                    <Share2 className="h-4 w-4 text-[#9CA3AF]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShareLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Share by Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleInviteEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite by Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-2"
                  >
                    <MoreVertical className="h-4 w-4 text-[#9CA3AF]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onRename?.(board)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(board)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(board)}
                    className="text-[#DC2626]"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
          {/* Members */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayedMembers.map((member, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                  {member.avatar && (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  )}
                  <AvatarFallback className="bg-[#4F46E5] text-white text-xs">
                    {member.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {remainingCount > 0 && (
              <span className="ml-2 text-xs text-[#6B7280]">
                +{remainingCount}
              </span>
            )}
          </div>

          {/* Last edited */}
          <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(board.lastEdited)}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
