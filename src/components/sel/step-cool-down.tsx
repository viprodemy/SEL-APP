"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CoolDownZone from './cool-down-zone';

interface StepCoolDownProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepCoolDown({ onNext, onBack }: StepCoolDownProps) {

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-4">
          Let's Try a Quick Exercise / 让我们来做一个快速练习
        </CardTitle>
         <p className="text-muted-foreground">Choose one exercise to calm yourself down. / 选择一个练习让自己冷静下来。</p>
      </CardHeader>
      <CardContent className="p-4">
        <CoolDownZone />
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-muted/50">
        <Button variant="outline" onClick={onBack}>
          Back / 返回
        </Button>
        <Button onClick={onNext} className="btn-glossy">I'm Done, Continue / 我完成了，继续</Button>
      </CardFooter>
    </Card>
  );
}
