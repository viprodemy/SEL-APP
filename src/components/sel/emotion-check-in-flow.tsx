"use client";

import { useState } from 'react';
import type { Emotion, StudentCheckIn } from '@/types';
import StepName from './step-name';
import StepEmotion from './step-emotion';
import StepDescribe from './step-describe';
import StepBodyScan from './step-body-scan';
import StepExpectations from './step-expectations';
import StepDecoder from './step-decoder';
import StepReframing from './step-reframing';
import StepSummary from './step-summary';
import StepCoolDown from './step-cool-down';
import StepPostCoolDownEmotion from './step-post-cool-down-emotion';
import StepPowerCard from './step-power-card';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAIQueue } from '@/hooks/use-ai-queue';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
// import { collection, addDoc } from 'firebase/firestore';
// import { useFirestore } from '@/firebase';
// import { errorEmitter } from '@/firebase/error-emitter';
// import { FirestorePermissionError } from '@/firebase/errors';
import { syncToGoogleSheets } from '@/lib/sheets-sync';
import { generateTeacherReport } from '@/ai/flows/generate-teacher-report';
import { emotions } from '@/lib/data';

export default function EmotionCheckInFlow() {
  const { toast } = useToast();
  const queue = useAIQueue();
  const processingRef = useRef(false);
  // const db = useFirestore();
  const [step, setStep] = useState(-1);
  const [studentName, setStudentName] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState({ need: '', hope: '', selfCare: '' });
  const [bodyScan, setBodyScan] = useState<string[]>([]);
  const [postCoolDownEmotion, setPostCoolDownEmotion] = useState<Emotion | null>(null);
  const [postCoolDownIntensity, setPostCoolDownIntensity] = useState(5);

  const handleStart = () => setStep(0);
  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleRestart = () => {
    setStep(-1);
    setStudentName('');
    setCheckInDate(new Date());
    setSelectedEmotion(null);
    setIntensity(5);
    setDescription('');
    setNeeds({ need: '', hope: '', selfCare: '' });
    setPostCoolDownEmotion(null);
    setPostCoolDownIntensity(5);
    setBodyScan([]);
  };

  const checkInData: Omit<StudentCheckIn, 'id'> = {
    student: studentName,
    date: checkInDate?.toISOString() || new Date().toISOString(),
    emotion: selectedEmotion?.id || '',
    intensity,
    description,
    bodyScan,
    needs,
    postCoolDownEmotion: postCoolDownEmotion?.id,
    postCoolDownIntensity: postCoolDownIntensity,
  };

  // Add this effect to auto-join queue when reaching AI steps
  useEffect(() => {
    if (step >= 5 && step <= 9 && queue.status === 'idle') {
      queue.joinQueue(studentName);
    }
  }, [step, queue.status, studentName]);
  
  const handleNextFromReframing = () => {
    if (selectedEmotion?.id !== 'happy' && selectedEmotion?.id !== 'proud') {
      setStep(7);
    } else {
      handleFinish();
    }
  }

  const handleFinish = async () => {
    // Already in queue/processing from step 5
    toast({
        title: "Finalizing... / 正在完成...",
        description: "Syncing data and releasing your AI slot. / 同步数据并释放 AI 席位。",
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
        
        // Relying on Google Sheets for storage as requested to avoid Firebase errors
        await syncToGoogleSheets(checkInData, aiReportText);

        toast({
            title: "Check-in Saved! / 签到成功！",
            description: "Your record is saved and synced to the teacher's drive. / 记录已保存并同步至教师云端。",
        });
        
        await queue.completeRequest();
        setStep(9);
    } catch (err) {
        console.error("AI report generation failed:", err);
        toast({
            variant: "destructive",
            title: "Error / 错误",
            description: "Something went wrong. Please try again. / 发生错误，请重试。",
        });
        await queue.failRequest(err);
    }
  }

  // Remove the old processAI effect since we now handle it per step
  
  const handleFinishFromPowerCard = () => {
    setStep(10);
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
            onNext={handleNext}
            onBack={handleBack}
            emotion={selectedEmotion}
            description={description}
            needs={needs}
          />
        );
      case 6:
        return (
          <StepReframing
            onNext={handleNextFromReframing}
            onBack={handleBack}
            emotion={selectedEmotion}
            description={description}
          />
        );
      case 7:
        return <StepCoolDown onNext={handleNext} onBack={handleBack} />;
      case 8:
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
      case 9:
        return <StepPowerCard onNext={handleFinishFromPowerCard} onBack={handleBack} emotion={selectedEmotion} />;
      case 10:
        return <StepSummary onRestart={handleRestart} checkInData={checkInData} />;
      default:
        return null;
    }
  };

  if (step === -1) {
    return (
        <button onClick={handleStart} className="px-8 py-4 bg-primary text-primary-foreground font-bold text-2xl rounded-full shadow-lg hover:bg-primary/90 transform hover:scale-105 transition-transform duration-300 btn-glossy">
            Let's Start! / 开始吧！
        </button>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {renderStep()}
            </motion.div>
        </AnimatePresence>

        {/* Queue Loader Overlay */}
        <AnimatePresence>
            {((queue.isWaiting) || (step === 9 && queue.status === 'processing')) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
                >
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
                                {queue.isWaiting ? "In Queue / 排队中" : "Finalizing Report / 正在生成报告"}
                            </h2>
                            <p className="text-muted-foreground">
                                {queue.isWaiting 
                                    ? `High traffic! Please wait... Your position: ${queue.position}\n当前人数较多！请稍候... 您的位置：${queue.position}`
                                    : "AI is creating the final report for your teacher. / AI 正在为老师生成最终报告。"
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
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
