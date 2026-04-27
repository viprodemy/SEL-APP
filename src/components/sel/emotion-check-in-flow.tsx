"use client";

import { useState } from 'react';
import type { Emotion, StudentCheckIn } from '@/types';
import StepName from './step-name';
import StepEmotion from './step-emotion';
import StepDescribe from './step-describe';
import StepBodyScan from './step-body-scan';
import StepExpectations from './step-expectations';
import StepDecoder from './step-decoder';
import StepSummary from './step-summary';
import StepCoolDown from './step-cool-down';
import StepPostCoolDownEmotion from './step-post-cool-down-emotion';
import StepPowerCard from './step-power-card';
import { useToast } from '@/hooks/use-toast';
import { useAIQueue } from '@/hooks/use-ai-queue';
import { useEffect, useRef } from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { syncToGoogleSheets } from '@/lib/sheets-sync';
import { generateTeacherReport } from '@/ai/flows/generate-teacher-report';
import { emotions } from '@/lib/data';

export default function EmotionCheckInFlow() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queue = useAIQueue();
  const processingRef = useRef(false);
  const [step, setStep] = useState(-1);
  const [studentName, setStudentName] = useState(user || '');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState({ need: '', hope: '', selfCare: '' });
  const [bodyScan, setBodyScan] = useState<string[]>([]);
  const [postCoolDownEmotion, setPostCoolDownEmotion] = useState<Emotion | null>(null);
  const [postCoolDownIntensity, setPostCoolDownIntensity] = useState(5);

  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleStart = () => {
    if (user) {
      setStep(1); // Directly to Emotion Selection
    } else {
      setStep(0); // To Name step
    }
  };
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleRestart = () => {
    setStep(-1);
    setStudentName(user || '');
    setCheckInDate(new Date());
    setSelectedEmotion(null);
    setIntensity(5);
    setDescription('');
    setNeeds({ need: '', hope: '', selfCare: '' });
    setPostCoolDownEmotion(null);
    setPostCoolDownIntensity(5);
    setBodyScan([]);
    setIsFinalizing(false);
  };

  const checkInData: Omit<StudentCheckIn, 'id'> & { loggedInUser?: string } = {
    student: studentName,
    date: checkInDate?.toISOString() || new Date().toISOString(),
    emotion: selectedEmotion?.id || '',
    intensity,
    description,
    bodyScan,
    needs,
    postCoolDownEmotion: postCoolDownEmotion?.id,
    postCoolDownIntensity: postCoolDownIntensity,
    loggedInUser: user || 'Anonymous',
  };

  useEffect(() => {
    if (user) {
      setStudentName(user);
    }
  }, [user]);

  useEffect(() => {
    // Join for Step 5 (Decoder/Combined)
    const aiSteps = [5];
    if (aiSteps.includes(step) && queue.status === 'idle') {
      queue.joinQueue(studentName);
    }
  }, [step, queue.status, studentName]);
  
  const handleNextFromDecoder = () => {
    if (selectedEmotion?.id !== 'happy' && selectedEmotion?.id !== 'proud') {
      setStep(6); // Go to Cool Down Exercises
    } else {
      setStep(7); // Go to Post-cool down check
    }
  }

  const handleFinish = async () => {
    setIsFinalizing(true);
    if (queue.status === 'idle') {
      await queue.joinQueue(studentName);
      return; 
    }

    toast({
        title: "Finalizing... / 正在完成...",
        description: "Syncing data and releasing AI slot. / 同步数据并释放 AI 席位。",
    });

    let aiReportText = '';
    try {
        const emotionName = emotions.find(e => e.id === selectedEmotion?.id)?.name.en || selectedEmotion?.id;
        const postCoolDownEmotionName = postCoolDownEmotion ? emotions.find(e => e.id === postCoolDownEmotion.id)?.name.en : undefined;
        
        const result = await generateTeacherReport({
            studentName: studentName,
            emotion: emotionName || 'Unknown',
            intensity: intensity,
            description: description,
            bodyScan: bodyScan,
            needs: needs,
            postCoolDownEmotion: postCoolDownEmotionName,
            postCoolDownIntensity: postCoolDownIntensity,
        });
        aiReportText = result.report;
        
        await syncToGoogleSheets(checkInData, aiReportText);

        toast({
            title: "Check-in Saved! / 签到成功！",
            description: "Your record is saved and synced. / 记录已保存并同步。",
        });
        
        await queue.completeRequest();
        setStep(8); // Go to Power Card
    } catch (err) {
        console.error("AI report generation failed:", err);
        toast({
            variant: "destructive",
            title: "Error / 错误",
            description: "Something went wrong. / 发生错误。",
        });
        await queue.failRequest(err);
    }
  }

  useEffect(() => {
    if (step === 7 && isFinalizing && queue.isProcessing && !processingRef.current) {
        processingRef.current = true;
        handleFinish().finally(() => {
            processingRef.current = false;
        });
    }
  }, [step, isFinalizing, queue.isProcessing]);
  
  const handleFinishFromPowerCard = () => {
    setStep(9);
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepName
            onNext={handleNext}
            studentName={studentName}
            setStudentName={setStudentName}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
          />
        );
      case 1:
        return (
          <StepEmotion
            onNext={handleNext}
            onBack={handleBack}
            setSelectedEmotion={setSelectedEmotion}
            setIntensity={setIntensity}
            selectedEmotion={selectedEmotion}
            intensity={intensity}
          />
        );
      case 2:
        return (
          <StepDescribe
            onNext={handleNext}
            onBack={handleBack}
            description={description}
            setDescription={setDescription}
            emotion={selectedEmotion}
          />
        );
      case 3:
        return <StepBodyScan onNext={handleNext} onBack={handleBack} emotion={selectedEmotion} bodyScan={bodyScan} setBodyScan={setBodyScan} />;
      case 4:
        return (
          <StepExpectations
            onNext={handleNext}
            onBack={handleBack}
            setNeeds={setNeeds}
            needs={needs}
            emotion={selectedEmotion}
          />
        );
      case 5:
        return (
          <StepDecoder
            onNext={handleNextFromDecoder}
            onBack={handleBack}
            emotion={selectedEmotion}
            description={description}
            needs={needs}
            isQueueProcessing={queue.isProcessing}
            onAnalysisDone={() => queue.completeRequest()}
          />
        );
      case 6:
        return <StepCoolDown onNext={handleNext} onBack={handleBack} />;
      case 7:
        return (
            <StepPostCoolDownEmotion
                onNext={handleFinish}
                onBack={handleBack}
                setSelectedEmotion={setPostCoolDownEmotion}
                setIntensity={setPostCoolDownIntensity}
                selectedEmotion={postCoolDownEmotion}
                intensity={postCoolDownIntensity}
            />
        );
      case 8:
        return <StepPowerCard onNext={handleFinishFromPowerCard} onBack={handleBack} emotion={selectedEmotion} />;
      case 9:
        return <StepSummary onRestart={handleRestart} checkInData={checkInData} />;
      default:
        return null;
    }
  };

  if (step === -1) {
    return (
      <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4 w-full max-w-sm">
          <label className="text-lg md:text-xl font-bold text-center block text-foreground font-headline">
            Today is... / 今天的日期是...
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-center text-left font-medium text-lg h-14 rounded-full border-2 border-primary/20 hover:border-primary transition-all bg-white shadow-sm",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl" align="center">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
                className="rounded-3xl"
              />
            </PopoverContent>
          </Popover>
        </div>

        <button 
          onClick={handleStart} 
          className="px-12 py-5 bg-primary text-primary-foreground font-bold text-2xl rounded-full shadow-2xl hover:bg-primary/90 transform hover:scale-105 active:scale-95 transition-all duration-300 btn-glossy flex items-center gap-3"
        >
          Let's Start! / 开始吧！
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
        <div key={step}>
            {renderStep()}
        </div>

        {/* Queue Loader Overlay */}
        {((queue.isWaiting) || (step === 7 && queue.isProcessing)) && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-card border shadow-2xl rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            {queue.isWaiting && queue.position > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                                    {queue.position}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-headline font-bold text-primary">
                                {queue.isWaiting ? "In Queue / 排队中" : "AI Thinking / AI 思考中"}
                            </h2>
                            <p className="text-foreground font-medium">
                                {queue.isWaiting 
                                    ? `High traffic! Please wait... Your position: ${queue.position}\n当前人数较多！请稍候... 您的位置：${queue.position}`
                                    : "AI is analyzing your check-in and generating insights.\nAI 正在分析您的回馈并生成建议。"
                                }
                            </p>
                        </div>

                        {queue.isWaiting && (
                            <div className="text-xs text-muted-foreground mt-4">
                                Concurrent AI Slots: {queue.activeCount} / 10
                                <br />
                                AI 并发席位：{queue.activeCount} / 10
                            </div>
                        )}
                    </div>
                </div>
            )}
    </div>
  );
}
