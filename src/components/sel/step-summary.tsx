"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Repeat } from 'lucide-react';
import type { StudentCheckIn } from '@/types';
import { emotions } from '@/lib/data';

interface StepSummaryProps {
  onRestart: () => void;
  checkInData: Omit<StudentCheckIn, 'id'>;
}

export default function StepSummary({ onRestart, checkInData }: StepSummaryProps) {
  const initialEmotion = emotions.find(e => e.id === checkInData.emotion);
  const finalEmotion = emotions.find(e => e.id === checkInData.postCoolDownEmotion);

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto px-4">
      <Card className="shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in duration-500 text-center border-2 border-primary/10">
        <CardHeader className="bg-primary/5 p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-full shadow-lg border-2 border-primary/10">
                <PartyPopper className="w-16 h-16 md:w-20 md:h-20 text-primary animate-bounce" />
            </div>
          </div>
          <CardTitle className="font-headline text-3xl md:text-5xl font-extrabold text-primary leading-tight">
            Check-in Complete!
            <br />
            <span className="text-2xl md:text-3xl opacity-80">签到完成！</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="text-xl md:text-2xl font-medium text-primary leading-relaxed text-center sm:text-left">
            <div className="p-6 bg-primary/5 rounded-2xl border-l-4 border-primary">
                <p>
                    Well done, <span className="font-bold underline text-primary">{checkInData.student}</span>! You've taken a moment to understand your feeling of <span className="font-bold text-accent-foreground">{initialEmotion?.name.en} ({initialEmotion?.emoji})</span>.
                    {finalEmotion && (
                    <>
                        {' '}After the cool-down, it's great that you're now feeling <span className="font-bold text-accent-foreground">{finalEmotion.name.en} ({finalEmotion.emoji})</span>.
                    </>
                    )}
                </p>
            </div>
            <div className="p-6 mt-6 bg-muted/30 rounded-2xl">
                <p className="text-lg md:text-xl text-muted-foreground italic">
                    干得好，<span className="font-bold">{checkInData.student}</span>！你花了一些时间来了解你的 <span className="font-bold">{initialEmotion?.name.zh} ({initialEmotion?.emoji})</span> 情绪。
                    {finalEmotion && (
                    <>
                        {' '}冷静下来之后，你现在感觉 <span className="font-bold">{finalEmotion.name.zh} ({finalEmotion.emoji})</span>，这太棒了。
                    </>
                    )}
                </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" onClick={onRestart} className="w-full sm:w-auto h-16 rounded-full px-10 text-lg font-bold btn-glossy shadow-xl">
              <Repeat className="mr-3 h-6 w-6" />
              New Check-in / 新的签到
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
