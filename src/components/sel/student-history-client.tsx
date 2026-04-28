"use client";

import { useEffect, useMemo, useState } from 'react';
import { emotions } from '@/lib/data';
import type { StudentCheckIn } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { format } from 'date-fns';
import { CalendarIcon, History, Wind, Heart, Activity, User, Smile } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { fetchCheckinsFromSheets } from '@/lib/sheets-fetch';
import { Badge } from '../ui/badge';

function safeDate(dateStr: string | number | Date): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  if (typeof dateStr === 'string') {
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const hour = parseInt(match[4] || '0', 10);
      const minute = parseInt(match[5] || '0', 10);
      const second = parseInt(match[6] || '0', 10);
      d = new Date(year, month, day, hour, minute, second);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date(); 
}

const CheckinDetail = ({icon: Icon, title, title_zh, children}: {icon: React.ElementType, title: string, title_zh: string, children: React.ReactNode}) => (
    <div className="text-left">
        <h4 className="font-bold flex items-center gap-2 mb-1 text-primary">
            <Icon className="w-4 h-4" />
            {title} / {title_zh}
        </h4>
        <div className="text-black pl-6">{children}</div>
    </div>
)

export default function StudentHistoryClient() {
  const { user } = useAuth();
  const [allCheckins, setAllCheckins] = useState<StudentCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const klFormatter = useMemo(() => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }), []);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      setLoading(true);
      try {
        const result = await fetchCheckinsFromSheets();
        if (result.success && result.data) {
          const mappedData: StudentCheckIn[] = result.data
            .map((row: any, index: number) => {
              const normalizedRow: any = {};
              Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().replace(/[\s_]/g, '')] = row[key];
              });

              // Check if this record belongs to the current user
              const recordName = normalizedRow.studentname || normalizedRow.student || row.Student || row['Student Name'] || row.Name || row['姓名'] || row['名字'] || 'Unknown';
              
              if (recordName.toLowerCase() !== user.toLowerCase()) return null;

              return {
                id: `${recordName}_${normalizedRow.date || normalizedRow.timestamp || index}`,
                student: recordName,
                date: normalizedRow.date || normalizedRow.timestamp || row.Date || row.Timestamp || new Date().toISOString(),
                emotion: normalizedRow.emotion || row.Emotion || '',
                intensity: Number(normalizedRow.intensity || row.Intensity || 0),
                description: normalizedRow.description || row.Description || '',
                bodyScan: typeof normalizedRow.bodyscan === 'string' ? normalizedRow.bodyscan.split(',').map((s: string) => s.trim()) : 
                          (Array.isArray(row.bodyScan) ? row.bodyScan : []),
                needs: {
                  need: (normalizedRow.needs || '').split(/Hope:|希望:/i)[0]?.replace(/Need:|需求:/i, '').trim() || '',
                  hope: (normalizedRow.needs || '').split(/Hope:|希望:/i)[1]?.split(/Care:|照顾:|Self-Care:/i)[0]?.trim() || '',
                  selfCare: (normalizedRow.needs || '').split(/Care:|照顾:|Self-Care:/i)[1]?.trim() || ''
                },
                postCoolDownEmotion: normalizedRow.postemotion || row.postEmotion || '',
                postCoolDownIntensity: Number(normalizedRow.postintensity || row.postIntensity || 0)
              };
            })
            .filter(Boolean) as StudentCheckIn[];

          mappedData.sort((a, b) => safeDate(b.date).getTime() - safeDate(a.date).getTime());
          setAllCheckins(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch student history", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <User className="w-16 h-16 text-primary mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">Please Login</h2>
        <p className="text-muted-foreground">You need to be logged in to view your history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-0">
      <header className="mb-10 text-left">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3">
          <History className="w-8 h-8" />
          My Journey / 我的记录
        </h1>
        <p className="text-lg text-muted-foreground mt-2">See your emotional progress and look back at your check-ins.</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
      ) : allCheckins.length === 0 ? (
        <Card className="p-20 text-center rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5">
          <Smile className="w-20 h-20 mx-auto mb-4 text-primary opacity-20" />
          <h2 className="text-2xl font-bold text-primary">No Records Yet</h2>
          <p className="text-muted-foreground mt-2 text-lg">Your emotional journey starts with your first check-in!</p>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-6">
          {allCheckins.map((checkin, index) => {
            const emotion = emotions.find(e => e.id === checkin.emotion);
            const postCoolDownEmotion = checkin.postCoolDownEmotion ? emotions.find(e => e.id === checkin.postCoolDownEmotion) : null;

            return (
              <AccordionItem value={`item-${index}`} key={checkin.id} className="border-2 border-primary/10 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow">
                <AccordionTrigger className="hover:no-underline p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full text-left">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-5xl md:text-6xl drop-shadow-sm">{emotion?.emoji}</div>
                      <div>
                        <p className="text-xl md:text-2xl font-black text-primary">{emotion?.name.en} / {emotion?.name.zh}</p>
                        <p className="text-base font-medium text-muted-foreground flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {klFormatter.format(safeDate(checkin.date))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {postCoolDownEmotion && (
                         <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                           <Wind className="w-4 h-4 text-primary" />
                           <span className="text-2xl">{postCoolDownEmotion.emoji}</span>
                         </div>
                       )}
                       <Badge className="bg-primary hover:bg-primary px-4 py-2 rounded-full text-lg font-bold">
                         {checkin.intensity}/10
                       </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 md:p-10 border-t-2 border-primary/5 bg-primary/5 space-y-8">
                   <div className="grid md:grid-cols-2 gap-8">
                      <CheckinDetail icon={User} title="What happened" title_zh="发生了什么">
                        <p className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">{checkin.description}</p>
                      </CheckinDetail>

                      <CheckinDetail icon={Activity} title="Body Scan" title_zh="身体扫描">
                         <div className="flex flex-wrap gap-2">
                           {checkin.bodyScan.map(part => (
                             <Badge key={part} variant="outline" className="bg-white text-primary rounded-lg border-primary/20">
                               {part}
                             </Badge>
                           ))}
                         </div>
                      </CheckinDetail>

                      <CheckinDetail icon={Heart} title="Needs & Hopes" title_zh="需求与希望">
                        <div className="space-y-3 bg-white p-4 rounded-2xl border border-primary/10 shadow-sm text-sm">
                           <p><strong>Need:</strong> {checkin.needs.need || '-'}</p>
                           <p><strong>Hope:</strong> {checkin.needs.hope || '-'}</p>
                           <p><strong>Care:</strong> {checkin.needs.selfCare || '-'}</p>
                        </div>
                      </CheckinDetail>

                      {postCoolDownEmotion && (
                        <CheckinDetail icon={Smile} title="After Cool-down" title_zh="练习之后">
                          <div className="bg-white p-4 rounded-2xl border border-accent/20 shadow-sm flex items-center gap-4">
                             <span className="text-4xl">{postCoolDownEmotion.emoji}</span>
                             <div>
                               <p className="font-bold">{postCoolDownEmotion.name.en}</p>
                               <p className="text-xs text-muted-foreground uppercase">Improved Intensity: {checkin.postCoolDownIntensity}/10</p>
                             </div>
                          </div>
                        </CheckinDetail>
                      )}
                   </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
