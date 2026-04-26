"use client";

import { useState } from 'react';
import type { Emotion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepBodyScanProps {
  onNext: () => void;
  onBack: () => void;
  emotion: Emotion | null;
  bodyScan: string[];
  setBodyScan: (bodyScan: string[]) => void;
}

const bodyParts = [
  { id: 'head', name: { en: 'Head', zh: '头部' } },
  { id: 'eyes', name: { en: 'Eyes', zh: '眼睛' } },
  { id: 'throat', name: { en: 'Throat', zh: '喉咙' } },
  { id: 'shoulders', name: { en: 'Shoulders', zh: '肩膀' } },
  { id: 'chest', name: { en: 'Chest', zh: '胸口' } },
  { id: 'stomach', name: { en: 'Stomach', zh: '肚子' } },
  { id: 'arms', name: { en: 'Arms', zh: '手臂' } },
  { id: 'hands', name: { en: 'Hands', zh: '手' } },
  { id: 'legs', name: { en: 'Legs', zh: '腿' } },
  { id: 'feet', name: { en: 'Feet', zh: '脚' } },
];

const sensations = [
    { id: 'tight', name: { en: 'Tight', zh: '紧绷' } },
    { id: 'heavy', name: { en: 'Heavy', zh: '沉重' } },
    { id: 'warm', name: { en: 'Warm', zh: '温热' } },
];


export default function StepBodyScan({ onNext, onBack, emotion, bodyScan, setBodyScan }: StepBodyScanProps) {
    const [selectedPart, setSelectedPart] = useState<{ id: string; name: { en: string; zh: string } } | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handlePartClick = (part: { id: string; name: { en: string; zh: string } }) => {
        setSelectedPart(part);
        setIsDialogOpen(true);
    };

    const handleSensationClick = (sensation: { id: string; name: { en: string; zh: string } }) => {
        if (selectedPart) {
            const newSelection = `${selectedPart.name.en} (${selectedPart.name.zh}): ${sensation.name.en} (${sensation.name.zh})`;
            if (!bodyScan.includes(newSelection)) {
                setBodyScan([...bodyScan, newSelection]);
            }
        }
        setIsDialogOpen(false);
    };

    const removeSelection = (selection: string) => {
        setBodyScan(bodyScan.filter(s => s !== selection));
    }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-4">
          <span className="text-5xl">{emotion?.emoji}</span>
          Feel Your Body / 感受身体
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full max-w-xs">
                <Image 
                    src="https://i.postimg.cc/R0Ybb2gH/Whats-App-Image-2025-11-05-at-11-56-41.jpg" 
                    alt="Body Scan Guide" 
                    width={400} 
                    height={600} 
                    className="rounded-lg object-contain"
                />
            </div>
            <div className="space-y-4 text-center md:text-left md:w-2/3">
                <p className="text-lg font-medium text-foreground">
                Close your eyes for a moment. Where in your body do you feel the emotion?
                <br />
                <span className="text-sm text-muted-foreground">闭上眼睛，感受一下，情绪在你身体的哪个部位？</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {bodyParts.map(part => (
                        <Button key={part.id} variant="outline" onClick={() => handlePartClick(part)}>
                            {part.name.en} / {part.name.zh}
                        </Button>
                    ))}
                </div>
            </div>
        </div>

        {bodyScan.length > 0 && (
            <div className="w-full pt-4 border-t">
                <h3 className="text-center font-semibold mb-2">Your Selections:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {bodyScan.map((selection, index) => (
                        <Badge key={index} variant="secondary" className="text-base py-1 pl-3 pr-2">
                            {selection}
                            <button onClick={() => removeSelection(selection)} className="ml-2 rounded-full hover:bg-black/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>What sensation do you feel in your {selectedPart?.name.en}? / 你的{selectedPart?.name.zh}有什么感觉？</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 pt-4">
                    {sensations.map(sensation => (
                        <Button key={sensation.id} variant="secondary" onClick={() => handleSensationClick(sensation)}>
                            {sensation.name.en} / {sensation.name.zh}
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} className="btn-glossy">I've Noticed. Continue. / 我注意到了，继续</Button>
      </CardFooter>
    </Card>
  );
}
