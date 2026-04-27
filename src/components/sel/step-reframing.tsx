"use client";

import { useEffect, useState, useRef } from 'react';
import type { Emotion } from '@/types';
import { provideEmotionReframing, type ProvideEmotionReframingOutput } from '@/ai/flows/provide-emotion-reframing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface StepReframingProps {
  onNext: () => void;
  onBack: () => void;
  emotion: Emotion | null;
  description: string;
  isQueueProcessing: boolean;
  onReframingDone: () => void;
}

export default function StepReframing({ onNext, onBack, emotion, description, isQueueProcessing, onReframingDone }: StepReframingProps) {
  const [reframing, setReframing] = useState<ProvideEmotionReframingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    async function getReframing() {
      if (!emotion || hasFetched.current || !isQueueProcessing) return;

      hasFetched.current = true;
      setIsLoading(true);
      try {
        const result = await provideEmotionReframing({ emotion: emotion.name.en, description });
        setReframing(result);
        onReframingDone(); // Release queue slot
      } catch (error) {
        console.error("Error getting reframing statements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getReframing();
  }, [emotion, description, isQueueProcessing, onReframingDone]);

  const statement = reframing?.reframingStatement;
  const isPositiveEmotion = emotion?.id === 'happy' || emotion?.id === 'proud';

  return (
    <Card className="shadow-2xl w-full max-w-3xl mx-auto overflow-hidden rounded-3xl">
      <CardHeader className="p-6 md:p-10 bg-primary/5">
        <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-4 text-primary leading-tight font-bold">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
          Positive Reframing / 正向思考
        </CardTitle>
        <p className="text-foreground font-semibold">Let's turn this feeling into a strength. / 让我们把这种感觉变成一种力量。</p>
      </CardHeader>
      <CardContent className="p-6 md:p-10">
        {isLoading ? (
          <div className="space-y-4 py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin mb-4" />
            <div className="space-y-2 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-primary animate-pulse">Positive Reframing... / 正向思考中...</h3>
                <p className="text-foreground font-medium max-w-xs mx-auto">Finding a way to turn this feeling into a positive strength.</p>
            </div>
          </div>
        ) : (
          statement && (
            <div className="bg-accent/10 border-l-4 border-accent p-8 rounded-2xl shadow-inner animate-in zoom-in duration-500">
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{statement.en}</p>
                <div className="h-px bg-accent/20 my-6"></div>
                <p className="text-xl md:text-2xl text-foreground font-semibold">{statement.zh}</p>
            </div>
          )
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} className="btn-glossy">
            {isPositiveEmotion ? "Finish & See My Summary" : "I Understand. Let's Cool Down / 好的，我要去冷静一下"}
        </Button>
      </CardFooter>
    </Card>
  );
}
