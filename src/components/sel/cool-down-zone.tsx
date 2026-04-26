"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function CoolDownZone() {

  const breathingVideos = [
    { name: 'Video 1', url: 'https://drive.google.com/file/d/1IbxD2UhVXX0VzyqNoFR-fWsPIeRdTZxR/view?usp=sharing' },
  ];

  const bodyRelaxationVideos = [
    { name: 'Video 1', url: 'https://drive.google.com/file/d/12U8SNedFSIJRAxou_TOqBfc28407_PHx/view?usp=sharing' },
  ];

  const imaginationVideos = [
    { name: 'Video 1', url: 'https://drive.google.com/file/d/1fSq0gXYpqPqFfZn5RLVhVeigFKZCtKKT/view?usp=sharing' },
    { name: 'Video 2', url: 'https://drive.google.com/file/d/1x-7umWGqlRB4wxIq8kr3GCqy-NYcABg1/view?usp=sharing' },
    { name: 'Video 3', url: 'https://drive.google.com/file/d/1lvyptFoMtQuTKKodgrwiT3XBbcry6Gwp/view?usp=sharing' },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl font-semibold text-left">
          <div className="flex flex-col text-left">
            <span>1. PSL Relaxation Breathing for Emotional Calm</span>
            <span>PSL 放松情绪呼吸法</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {breathingVideos.map(video => (
                    <Button asChild key={video.name} variant="outline">
                        <Link href={video.url} target="_blank">
                            {video.name}
                        </Link>
                    </Button>
                ))}
            </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="text-xl font-semibold text-left">2. PSL Body relaxation/ PSL 身体放松</AccordionTrigger>
        <AccordionContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bodyRelaxationVideos.map(video => (
                    <Button asChild key={video.name} variant="outline">
                        <Link href={video.url} target="_blank">
                            {video.name}
                        </Link>
                    </Button>
                ))}
            </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="text-xl font-semibold text-left">3. Imagery Relaxation Journey/ 想象放松之旅</AccordionTrigger>
        <AccordionContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imaginationVideos.map(video => (
                    <Button asChild key={video.name} variant="outline">
                        <Link href={video.url} target="_blank">
                            {video.name}
                        </Link>
                    </Button>
                ))}
            </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="text-xl font-semibold text-left">4. Write or Draw Your Feelings / 写下或画出你的感受</AccordionTrigger>
        <AccordionContent className="p-4 space-y-4 text-left">
            <p className="text-lg">Please get paper and pen from your teacher.</p>
            <p className="text-lg">请找老师拿纸张和笔。</p>
            <Textarea placeholder="Express what's on your mind. It doesn't need to be perfect. / 表达你内心的想法。它不需要完美。" className="min-h-[200px]" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
