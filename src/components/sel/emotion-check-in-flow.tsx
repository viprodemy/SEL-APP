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
// import { collection, addDoc } from 'firebase/firestore';
// import { useFirestore } from '@/firebase';
// import { errorEmitter } from '@/firebase/error-emitter';
// import { FirestorePermissionError } from '@/firebase/errors';
import { syncToGoogleSheets } from '@/lib/sheets-sync';
import { generateTeacherReport } from '@/ai/flows/generate-teacher-report';
import { emotions } from '@/lib/data';

export default function EmotionCheckInFlow() {
  const { toast } = useToast();
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
  
  const handleNextFromReframing = () => {
    if (selectedEmotion?.id !== 'happy' && selectedEmotion?.id !== 'proud') {
      setStep(7);
    } else {
      handleFinish();
    }
  }

  const handleFinish = async () => {
    toast({
        title: "Syncing data... / 同步中...",
        description: "Please wait a moment while we save your record and generate the teacher report.",
    });

    // Generate AI Summary for the teacher PDF in Drive
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
    } catch (err) {
      console.error("AI report generation failed for sync:", err);
    }

    // Relying on Google Sheets for storage as requested to avoid Firebase errors
    syncToGoogleSheets(checkInData, aiReportText);

    toast({
        title: "Check-in Saved! / 签到成功！",
        description: "Your record is saved and synced to the teacher's drive. / 记录已保存并同步至教师云端。",
    });
    setStep(9);
  }
  
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
    <div className="w-full max-w-4xl mx-auto">
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
    </div>
  );
}
