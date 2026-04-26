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
    <Card className="shadow-2xl max-w-lg mx-auto">
      <CardHeader className="items-center text-center p-8">
        <CardTitle className="font-headline text-4xl flex items-center gap-4 text-primary">
          Let's Get Started!
        </CardTitle>
        <p className="text-muted-foreground">准备开始！</p>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-lg font-semibold text-center block">My name is... / 我的名字是...</Label>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            <Input 
              id="name" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)} 
              placeholder="e.g., Alex" 
              className="text-lg h-14 rounded-full text-center"
            />
          </div>
        </div>
        <div className="space-y-3">
            <Label htmlFor="date" className="text-lg font-semibold text-center block">Today is... / 今天的日期是...</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-center text-left font-normal text-lg h-14 rounded-full",
                    !checkInDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-6">
        <Button onClick={onNext} disabled={!studentName.trim() || !checkInDate} size="lg" className="btn-glossy">
          Start Check-in
        </Button>
      </CardFooter>
    </Card>
  );
}
