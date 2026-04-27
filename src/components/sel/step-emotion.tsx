"use client";

import type { Emotion } from '@/types';
import { emotions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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
      <CardHeader className="p-6 md:p-10">
        <CardTitle className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center text-primary leading-tight">
            What are you feeling right now?
        </CardTitle>
        <p className="text-foreground mt-2 text-center font-semibold">你现在的情绪是什么？</p>
      </CardHeader>
      <CardContent className="p-4 md:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mb-8">
          {emotions.map((emotion, index) => (
            <div
              key={emotion.id}
            >
              <Card
                onClick={() => setSelectedEmotion(emotion)}
                className={cn(
                  "cursor-pointer transition-all duration-300 ease-in-out text-center p-3 md:p-6 flex flex-col items-center justify-center aspect-square rounded-2xl md:rounded-3xl group border-2",
                  selectedEmotion?.id === emotion.id
                    ? 'border-accent bg-secondary shadow-lg scale-105'
                    : 'border-transparent bg-card hover:bg-yellow-50 hover:border-yellow-200'
                )}
              >
                <div 
                    className="text-4xl sm:text-5xl md:text-6xl mb-2"
                >
                    {emotion.emoji}
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm md:text-base font-bold leading-tight text-foreground">{emotion.name.en}</p>
                    <p className="text-[10px] md:text-xs font-semibold leading-tight text-foreground/70">{emotion.name.zh}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {selectedEmotion && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500 max-w-2xl mx-auto bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <h3 className="text-center text-lg md:text-xl font-bold text-foreground">
              How strong is this feeling? <span className="text-primary/50 text-sm">(0-10)</span>
              <p className="text-foreground/80 text-sm font-semibold">这股情绪的强度有多大？</p>
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 w-full">
                <span className="text-4xl md:text-5xl flex-shrink-0">{selectedEmotion.emoji}</span>
                <Slider
                    value={[intensity]}
                    onValueChange={(value) => setIntensity(value[0])}
                    max={10}
                    step={1}
                    className="flex-1"
                />
                <span className="text-3xl md:text-4xl font-black w-12 text-foreground">{intensity}</span>
              </div>
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
