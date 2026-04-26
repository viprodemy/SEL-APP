"use client";

import type { Emotion } from '@/types';
import { emotions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepEmotionProps {
  onNext: () => void;
  onBack: () => void;
  setSelectedEmotion: (emotion: Emotion) => void;
  setIntensity: (intensity: number) => void;
  selectedEmotion: Emotion | null;
  intensity: number;
}

export default function StepEmotion({
  onNext,
  onBack,
  setSelectedEmotion,
  setIntensity,
  selectedEmotion,
  intensity,
}: StepEmotionProps) {
  return (
    <Card className="overflow-hidden shadow-2xl rounded-3xl animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-center text-primary">
            What are you feeling right now?
        </CardTitle>
        <p className="text-muted-foreground mt-2 text-center">你现在的情绪是什么？</p>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {emotions.map((emotion, index) => (
            <motion.div
              key={emotion.id}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300 }}
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -5, 0],
              }}
              // @ts-ignore
              custom={index}
            >
              <Card
                onClick={() => setSelectedEmotion(emotion)}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl text-center p-4 flex flex-col items-center justify-center aspect-square rounded-2xl group",
                  selectedEmotion?.id === emotion.id
                    ? 'ring-4 ring-accent ring-offset-2 bg-secondary shadow-2xl scale-105'
                    : 'bg-card hover:bg-yellow-100'
                )}
              >
                <motion.div 
                    className="text-6xl mb-2"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    // @ts-ignore
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        delay: index * 0.2
                    }}
                >
                    {emotion.emoji}
                </motion.div>
                <p className="text-sm font-medium text-center leading-tight">{emotion.name.en}</p>
                <p className="text-xs font-medium text-center leading-tight text-muted-foreground">{emotion.name.zh}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedEmotion && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h3 className="text-center text-lg font-medium text-foreground">
              How strong is this feeling? <span className="text-muted-foreground">(0-10)</span>
              <p className="text-muted-foreground text-sm">这股情绪的强度有多大？ (0-10)</p>
            </h3>
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <span className="text-4xl">{selectedEmotion.emoji}</span>
              <Slider
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                max={10}
                step={1}
              />
              <span className="text-2xl font-bold w-10 text-center">{intensity}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 p-6 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back / 返回
          </Button>
          <Button onClick={onNext} disabled={!selectedEmotion} className="btn-glossy">Continue / 继续</Button>
      </CardFooter>
    </Card>
  );
}
