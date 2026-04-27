"use client";

import type { Emotion } from '@/types';
import { emotions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface StepPostCoolDownEmotionProps {
  onNext: () => void;
  onBack: () => void;
  setSelectedEmotion: (emotion: Emotion) => void;
  setIntensity: (intensity: number) => void;
  selectedEmotion: Emotion | null;
  intensity: number;
}

export default function StepPostCoolDownEmotion({
  onNext,
  onBack,
  setSelectedEmotion,
  setIntensity,
  selectedEmotion,
  intensity,
}: StepPostCoolDownEmotionProps) {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-center text-primary">
            After the exercise, how are you feeling now?
        </CardTitle>
        <p className="text-foreground mt-2 text-center font-semibold">练习过后，你现在感觉如何？</p>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {emotions.map((emotion, index) => (
            <div
              key={emotion.id}
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
                <div 
                    className="text-5xl mb-2"
                >
                    {emotion.emoji}
                </div>
                <p className="text-sm font-bold text-center leading-tight text-foreground">{emotion.name.en}</p>
                <p className="text-xs font-semibold text-center leading-tight text-foreground/70">{emotion.name.zh}</p>
              </Card>
            </div>
          ))}
        </div>

        {selectedEmotion && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h3 className="text-center text-lg font-bold text-foreground">
                How strong is this feeling? <span className="text-primary/50">(0-10)</span>
                <p className="text-foreground/80 text-sm font-semibold">这个感觉有多强烈？ (0-10)</p>
            </h3>
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <span className="text-4xl">{selectedEmotion.emoji}</span>
              <Slider
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                max={10}
                step={1}
              />
              <span className="text-2xl font-bold w-10 text-center text-foreground">{intensity}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 p-6 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back / 返回
          </Button>
          <Button onClick={onNext} size="lg" disabled={!selectedEmotion} className="btn-glossy">Submit My Record / 提交我的记录</Button>
      </CardFooter>
    </Card>
  );
}
