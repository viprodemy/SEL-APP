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
    <Card className="shadow-2xl w-full max-w-3xl mx-auto overflow-hidden rounded-3xl">
      <CardHeader className="p-6 md:p-10 bg-primary/5">
        <CardTitle className="font-headline text-2xl md:text-3xl flex items-center gap-4 text-primary leading-tight font-bold">
          <span className="text-4xl md:text-5xl">{emotion?.emoji}</span>
          Feel Your Body / 感受身体
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 p-6 md:p-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full">
            <div className="w-full max-w-[280px] lg:max-w-xs bg-white p-4 rounded-3xl border-2 border-primary/10 shadow-inner">
                <Image 
                    src="https://i.postimg.cc/R0Ybb2gH/Whats-App-Image-2025-11-05-at-11-56-41.jpg" 
                    alt="Body Scan Guide" 
                    width={400} 
                    height={600} 
                    className="rounded-2xl object-contain w-full"
                />
            </div>
            <div className="space-y-6 md:w-full">
                <div className="bg-primary/5 p-6 rounded-2xl border-l-4 border-primary">
                    <p className="text-lg md:text-xl font-bold text-primary">
                    Close your eyes for a moment. Where in your body do you feel the emotion?
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">闭上眼睛，感受一下，情绪在你身体的哪个部位？</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bodyParts.map(part => (
                        <Button 
                            key={part.id} 
                            variant="outline" 
                            onClick={() => handlePartClick(part)}
                            className="h-auto py-3 px-2 flex flex-col text-xs md:text-sm hover:border-primary hover:bg-primary/5 rounded-xl border-2"
                        >
                            <span className="font-bold">{part.name.en}</span>
                            <span className="text-[10px] opacity-70 font-medium">{part.name.zh}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>

        {bodyScan.length > 0 && (
            <div className="w-full pt-8 border-t-2 border-dashed border-primary/20">
                <h3 className="text-center font-bold text-primary mb-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Your Selections / 已选中的感觉:
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {bodyScan.map((selection, index) => (
                        <Badge key={index} variant="secondary" className="text-sm md:text-base py-2 pl-4 pr-2 rounded-full border border-primary/20 bg-white text-primary font-medium">
                            {selection}
                            <button onClick={() => removeSelection(selection)} className="ml-3 rounded-full hover:bg-primary/10 p-1 text-primary">
                                <X className="h-4 w-4" />
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
