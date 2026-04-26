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
    <div className="space-y-6">
      <Card className="shadow-lg animate-in fade-in duration-300 text-left">
        <CardHeader className="items-center text-center">
          <div className="flex justify-center mb-4">
            <PartyPopper className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="font-headline text-4xl">
            Check-in Complete! / 签到完成！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="text-lg text-black max-w-md mx-auto text-left">
            <p>
                Well done, {checkInData.student}! You've taken a moment to understand your feeling of <span className="font-semibold">{initialEmotion?.name.en} ({initialEmotion?.name.zh})</span>.
                {finalEmotion && (
                <>
                    {' '}After the cool-down, it's great that you're now feeling <span className="font-semibold">{finalEmotion.name.en} ({finalEmotion.name.zh})</span>.
                </>
                )}
            </p>
            <p className="text-base mt-2 text-black/80">
                干得好，{checkInData.student}！你花了一些时间来了解你的 <span className="font-semibold">{initialEmotion?.name.zh} ({initialEmotion?.name.en})</span> 的感觉。
                {finalEmotion && (
                <>
                    {' '}冷静下来之后，你现在感觉 <span className="font-semibold">{finalEmotion.name.zh} ({finalEmotion.name.en})</span>，这太棒了。
                </>
                )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onRestart} className="w-full sm:w-auto btn-glossy">
              <Repeat className="mr-2 h-4 w-4" />
              Start a New Check-in / 开始新的签到
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
