"use client";

import { useState, useRef } from 'react';
import type { Emotion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { speechToText } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface Needs {
  need: string;
  hope: string;
  selfCare: string;
}
interface StepExpectationsProps {
  onNext: () => void;
  onBack: () => void;
  needs: Needs;
  setNeeds: (needs: Needs) => void;
  emotion: Emotion | null;
}

type RecordingField = keyof Needs | null;

export default function StepExpectations({ onNext, onBack, needs, setNeeds, emotion }: StepExpectationsProps) {
  const [isRecording, setIsRecording] = useState<RecordingField>(null);
  const [isTranscribing, setIsTranscribing] = useState<RecordingField>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleChange = (field: keyof Needs, value: string) => {
    setNeeds({ ...needs, [field]: value });
  };

  const handleToggleRecording = async (field: keyof Needs) => {
    if (isRecording === field) {
      mediaRecorderRef.current?.stop();
    } else if (isRecording) {
        toast({
            title: "Recording in Progress",
            description: "Please stop the current recording before starting a new one.",
            variant: "default",
        });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        setIsRecording(field);

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsRecording(null);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          transcribeAudio(audioBlob, field);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
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

  const transcribeAudio = async (audioBlob: Blob, field: keyof Needs) => {
    setIsTranscribing(field);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await speechToText({ audioDataUri: base64Audio });
        if (result.transcript) {
          handleChange(field, needs[field] ? `${needs[field]}\n${result.transcript}` : result.transcript);
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
      setIsTranscribing(null);
    }
  };


  return (
    <Card className="shadow-2xl w-full max-w-2xl mx-auto overflow-hidden rounded-3xl">
      <CardHeader className="p-6 md:p-10 bg-primary/5">
        <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-4 text-primary leading-tight font-bold">
          <span className="text-4xl md:text-5xl">{emotion?.emoji}</span>
          What Do You Need? / 你需要什么？
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="need" className="text-lg font-bold text-primary">What do you want? / 你想要什么？</Label>
          </div>
          <div className="relative group">
            <Textarea 
                id="need" 
                value={needs.need} 
                onChange={e => handleChange('need', e.target.value)} 
                placeholder="e.g., I need to be understood." 
                className="pr-14 min-h-[100px] text-lg rounded-2xl border-2 border-primary/10 focus:border-primary transition-all p-4" 
            />
            <Button 
                size="icon" 
                onClick={() => handleToggleRecording('need')} 
                disabled={!!isTranscribing && isTranscribing !== 'need'} 
                variant={isRecording === 'need' ? 'destructive' : 'outline'} 
                className={cn("absolute top-3 right-3 w-10 h-10 rounded-full shadow-sm", isRecording === 'need' && "animate-pulse")}
            >
                {isRecording === 'need' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
             {isTranscribing === 'need' && <Loader2 className="absolute top-4 right-4 animate-spin h-6 w-6 text-primary" />}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="hope" className="text-lg font-bold text-primary">What do you expect from others? / 你希望别人怎样？</Label>
          </div>
          <div className="relative group">
            <Textarea 
                id="hope" 
                value={needs.hope} 
                onChange={e => handleChange('hope', e.target.value)} 
                placeholder="e.g., I hope my friend will listen to me." 
                className="pr-14 min-h-[100px] text-lg rounded-2xl border-2 border-primary/10 focus:border-primary transition-all p-4" 
            />
            <Button 
                size="icon" 
                onClick={() => handleToggleRecording('hope')} 
                disabled={!!isTranscribing && isTranscribing !== 'hope'} 
                variant={isRecording === 'hope' ? 'destructive' : 'outline'} 
                className={cn("absolute top-3 right-3 w-10 h-10 rounded-full shadow-sm", isRecording === 'hope' && "animate-pulse")}
            >
                {isRecording === 'hope' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
             {isTranscribing === 'hope' && <Loader2 className="absolute top-4 right-4 animate-spin h-6 w-6 text-primary" />}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="selfCare" className="text-lg font-bold text-primary">What can you do now? / 你现在可以做什么？</Label>
          </div>
          <div className="relative group">
            <Textarea 
                id="selfCare" 
                value={needs.selfCare} 
                onChange={e => handleChange('selfCare', e.target.value)} 
                placeholder="e.g., I can take a few deep breaths." 
                className="pr-14 min-h-[100px] text-lg rounded-2xl border-2 border-primary/10 focus:border-primary transition-all p-4" 
            />
             <Button 
                size="icon" 
                onClick={() => handleToggleRecording('selfCare')} 
                disabled={!!isTranscribing && isTranscribing !== 'selfCare'} 
                variant={isRecording === 'selfCare' ? 'destructive' : 'outline'} 
                className={cn("absolute top-3 right-3 w-10 h-10 rounded-full shadow-sm", isRecording === 'selfCare' && "animate-pulse")}
            >
                {isRecording === 'selfCare' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
             {isTranscribing === 'selfCare' && <Loader2 className="absolute top-4 right-4 animate-spin h-6 w-6 text-primary" />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} disabled={!!isRecording || !!isTranscribing} className="btn-glossy">Continue / 继续</Button>
      </CardFooter>
    </Card>
  );
}
