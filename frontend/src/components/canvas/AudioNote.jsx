'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AudioNote({ isOpen, onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('[v0] Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (!audioBlob || !audioUrl) return;
    onSave(audioBlob, audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Audio Note</DialogTitle>
        </DialogHeader>

        <motion.div className="space-y-4 py-4">
          {!audioUrl ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  className={`p-4 rounded-full ${
                    isRecording ? 'bg-red-100' : 'bg-[#F3F4F6]'
                  }`}
                  animate={isRecording ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.6, repeat: isRecording ? Infinity : 0 }}
                >
                  <Mic
                    className={`h-8 w-8 ${
                      isRecording ? 'text-red-600' : 'text-[#6B7280]'
                    }`}
                  />
                </motion.div>
                <p className="text-sm text-[#6B7280]">
                  {isRecording ? 'Recording in progress...' : 'Click to start recording'}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-[#4F46E5] hover:bg-[#4338CA]"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#F3F4F6] rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-[#111827]">Recording ready</p>
                <audio src={audioUrl} controls className="w-full" />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setAudioUrl(null)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#4F46E5] hover:bg-[#4338CA]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Save Note
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}