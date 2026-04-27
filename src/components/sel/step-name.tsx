"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, User } from 'lucide-react';
import { format } from "date-fns"


interface StepNameProps {
  onNext: () => void;
  studentName: string;
  setStudentName: (name: string) => void;
  checkInDate: Date | undefined;
  setCheckInDate: (date: Date | undefined) => void;
}

export default function StepName({ onNext, studentName, setStudentName, checkInDate, setCheckInDate }: StepNameProps) {
  return (
    <Card className="shadow-2xl w-full max-w-lg mx-auto overflow-hidden rounded-3xl">
      <CardHeader className="items-center text-center p-6 md:p-10 bg-primary/5">
        <CardTitle className="font-headline text-3xl md:text-4xl flex items-center gap-3 text-primary justify-center font-bold">
          Let's Get Started!
        </CardTitle>
        <p className="text-muted-foreground font-medium mt-1">准备开始！</p>
      </CardHeader>
      <CardContent className="p-6 md:p-10 space-y-6 md:space-y-10">
        <div className="space-y-4">
          <Label htmlFor="name" className="text-lg md:text-xl font-bold text-center block text-primary">
            My name is... / 我的名字是...
          </Label>
          <div className="flex items-center gap-3 bg-white p-1 rounded-full border-2 border-primary/20 focus-within:border-primary transition-colors pr-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <User className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <Input 
              id="name" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
              placeholder="e.g., Alex" 
              className="text-lg md:text-xl h-12 md:h-14 border-none focus-visible:ring-0 text-center placeholder:text-muted-foreground/50 font-medium"
            />
          </div>
        </div>
        <div className="space-y-4">
            <Label htmlFor="date" className="text-lg md:text-xl font-bold text-center block text-primary">
                Today is... / 今天的日期是...
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-center text-left font-medium text-lg h-12 md:h-14 rounded-full border-2 border-primary/10 hover:border-primary/30 transition-all",
                    !checkInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl" align="center">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  initialFocus
                  className="rounded-3xl"
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center p-6 md:p-8 bg-muted/20">
        <Button onClick={onNext} disabled={!studentName.trim() || !checkInDate} size="lg" className="w-full md:w-auto px-12 h-14 rounded-full text-lg font-bold btn-glossy shadow-xl">
          Start Check-in / 开始签到
        </Button>
      </CardFooter>
    </Card>
  );
}
