"use client";

import { useState, useMemo } from 'react';
import type { Emotion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { powerCards } from '@/lib/data';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepPowerCardProps {
  onNext: () => void;
  onBack: () => void;
  emotion: Emotion | null;
}

export default function StepPowerCard({ onNext, onBack, emotion }: StepPowerCardProps) {
  const [isDrawn, setIsDrawn] = useState(false);

  const affirmation = useMemo(() => {
    if (!emotion || !powerCards[emotion.id]) return null;
    const cards = powerCards[emotion.id];
    return cards[Math.floor(Math.random() * cards.length)];
  }, [emotion]);

  const handleDrawCard = () => {
    setIsDrawn(true);
  };

  return (
    <Card className="shadow-lg text-center">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center justify-center gap-4">
          PSL The language of power / PSL 语言的力量
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
        {!isDrawn ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={handleDrawCard} size="lg" className="btn-glossy text-2xl h-auto py-4">
              抽卡 (Draw a Card)
            </Button>
          </motion.div>
        ) : (
          affirmation && (
            <motion.div
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md p-8 bg-accent/10 border-2 border-accent rounded-2xl shadow-2xl relative"
              style={{ perspective: '1000px' }}
            >
              <Sparkles className="absolute top-4 left-4 w-8 h-8 text-yellow-400" />
              <Sparkles className="absolute bottom-4 right-4 w-8 h-8 text-yellow-400" />
              <div className="text-left space-y-4">
                <p className="text-2xl font-bold text-black">{affirmation.en}</p>
                <p className="text-xl font-medium text-black">{affirmation.zh}</p>
              </div>
            </motion.div>
          )
        )}
      </CardContent>
      <CardFooter className="flex justify-center p-6 bg-muted/50">
        {isDrawn ? (
          <Button onClick={onNext} className="btn-glossy">Finish Check-in / 完成签到</Button>
        ) : (
          <Button variant="outline" onClick={onBack}>Back / 返回</Button>
        )}
      </CardFooter>
    </Card>
  );
}
