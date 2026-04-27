"use client";

import { useState, useRef } from 'react';
import type { Emotion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { speechToText } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StepDescribeProps {
  onNext: () => void;
  onBack: () => void;
  description: string;
  setDescription: (description: string) => void;
  emotion: Emotion | null;
}

export default function StepDescribe({ onNext, onBack, description, setDescription, emotion }: StepDescribeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          transcribeAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please enable microphone permissions in your browser settings.",
        });
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await speechToText({ audioDataUri: base64Audio });
        if (result.transcript) {
          setDescription(prev => prev ? `${prev}\n${result.transcript}` : result.transcript);
        } else {
            throw new Error("Transcription failed.");
        }
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "Could not transcribe the audio. Please try again.",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Card className="shadow-2xl w-full max-w-2xl mx-auto overflow-hidden rounded-3xl">
      <CardHeader className="p-6 md:p-10 bg-primary/5">
        <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-4 text-primary leading-tight font-bold">
          <span className="text-4xl md:text-5xl">{emotion?.emoji}</span>
          Let's Hear You Out / 你说给我听
        </CardTitle>
        <div className="text-foreground font-semibold">
          <p>Use simple sentences to write down what happened.</p>
          <p>用简单的句子写下事情的经过。</p>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
        <div className="p-4 md:p-6 bg-accent/10 rounded-2xl border-2 border-accent/20">
            <p className="font-bold text-foreground leading-relaxed">
            Recall the moment using your five senses — 
            what did you see, hear, smell, taste, or feel?
            </p>
            <p className="text-sm text-foreground/80 mt-2 font-semibold">
            用视觉、听觉、嗅觉、味觉、触觉回想触发情绪的情境。
            </p>
        </div>
        <div className="relative group">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="You can write about when it happened, who was there, where it was, and how/why you felt this way... / 你可以写下事情发生的时间、地点、人物，以及你为什么会有这种感觉..."
            className="min-h-[180px] md:min-h-[220px] text-lg p-6 rounded-2xl border-2 border-primary/10 focus:border-primary transition-all pr-16 md:pr-20 placeholder:text-muted-foreground/40"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-3">
            <Button 
                size="icon" 
                onClick={handleToggleRecording} 
                disabled={isTranscribing}
                variant={isRecording ? 'destructive' : 'outline'}
                className={cn("w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg border-2", isRecording && 'animate-pulse')}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            {isTranscribing && (
              <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white rounded-full border shadow-sm">
                <Loader2 className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} className="btn-glossy">Continue / 继续</Button>
      </CardFooter>
    </Card>
  );
}
