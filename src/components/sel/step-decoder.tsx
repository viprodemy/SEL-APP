"use client";

import { useEffect, useState, useRef } from 'react';
import type { Emotion } from '@/types';
import { analyzeEmotionalState, type AnalyzeEmotionalStateOutput } from '@/ai/flows/analyze-emotional-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, User, Users, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface StepDecoderProps {
  onNext: () => void;
  onBack: () => void;
  emotion: Emotion | null;
  description: string;
  needs: {
    need: string;
    hope: string;
    selfCare: string;
  };
  isQueueProcessing: boolean;
  onAnalysisDone: () => void;
}

const InfoCard = ({ icon, title, content_en, content_zh, isList = false }: { icon: React.ElementType, title: string, content_en: string | string[], content_zh: string | string[], isList?: boolean }) => {
    const Icon = icon;

    const renderContent = (content: string | string[]) => {
        if (isList && Array.isArray(content)) {
            return (
                <ul className="list-disc pl-5 space-y-1">
                    {content.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            );
        }
        return <p className="text-black whitespace-pre-line">{content}</p>;
    }

    return (
        <div className="bg-card/50 p-4 rounded-xl border border-primary-foreground/10 text-left">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-primary">
                <Icon className="w-5 h-5" />
                {title}
            </h3>
            <div className="text-black">{renderContent(content_en)}</div>
            <div className="text-sm text-black/70 mt-1">{renderContent(content_zh)}</div>
        </div>
    )
}

export default function StepDecoder({ onNext, onBack, emotion, description, needs, isQueueProcessing, onAnalysisDone }: StepDecoderProps) {
  const [analysis, setAnalysis] = useState<AnalyzeEmotionalStateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    async function getAnalysis() {
      if (!emotion || hasFetched.current || !isQueueProcessing) return;
      
      hasFetched.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeEmotionalState({
          emotion: emotion.name.en,
          description,
          needs,
        });
        setAnalysis(result);
        onAnalysisDone(); // Release queue slot
      } catch (err: any) {
        console.error("Error getting AI analysis:", err);
        if (err.message?.includes('429')) {
          setError("AI is busy right now (Quota Exceeded). Please wait a minute and try again. / 系统繁忙（达到限额），请等一分钟后再试。");
        } else {
          setError("I'm having trouble analyzing this right now. Let's try focusing on the known purpose of this emotion.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    getAnalysis();
  }, [emotion, description, needs, isQueueProcessing, onAnalysisDone]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-4">
          <BrainCircuit className="w-10 h-10 text-primary" />
          Emotion Decoder / 情绪解码器
        </CardTitle>
        <p className="text-muted-foreground">Let's explore this feeling together. / 让我们一起探索这种感觉。</p>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-primary/5">
        {isLoading ? (
          <div className="space-y-4 py-8 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-primary">AI is analyzing... / AI 正在分析...</h3>
                <p className="text-muted-foreground">Deeply exploring your feelings to give you the best advice. / 深入探索您的感受，为您提供最佳建议。</p>
            </div>
          </div>
        ) : error ? (
            <div className="p-4 bg-destructive/10 border-l-4 border-destructive text-destructive-foreground text-left">
                <p className="font-semibold text-black">Notice / 提示</p>
                <p className="text-black">{error}</p>
            </div>
        ) : (
          analysis && (
            <div className="space-y-4">
                <div className="p-4 rounded-lg text-left">
                    <p className="font-semibold text-black text-lg">{analysis.understanding.en}</p>
                    <p className="text-black/80 mt-1">{analysis.understanding.zh}</p>
                </div>
                
                <InfoCard 
                    icon={Lightbulb}
                    title="Suggestions for You / 给你的建议"
                    content_en={analysis.suggestions.map(s => s.en)}
                    content_zh={analysis.suggestions.map(s => s.zh)}
                    isList={true}
                />
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-t border-primary-foreground/10 pt-2">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            For Teachers & Parents / 给老师和家长的建议
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <InfoCard 
                          icon={BrainCircuit}
                          title="Meaning of this Emotion / 情绪的意义"
                          content_en={analysis.emotionMeaning.en}
                          content_zh={analysis.emotionMeaning.zh}
                      />
                      <InfoCard 
                          icon={Users}
                          title="How You Can Help / 如何提供帮助"
                          content_en={analysis.stakeholderSuggestions.en}
                          content_zh={analysis.stakeholderSuggestions.zh}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>
          )
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} className="btn-glossy">Continue / 继续</Button>
      </CardFooter>
    </Card>
  );
}
