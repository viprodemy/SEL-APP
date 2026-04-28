"use client";

import { useEffect, useMemo, useState } from 'react';
import { emotions } from '@/lib/data';
import type { StudentCheckIn } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { format } from 'date-fns';
import { CalendarIcon, History, Wind, Heart, Activity, User, Smile, Printer } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { fetchCheckinsFromSheets } from '@/lib/sheets-fetch';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateTeacherReport } from '@/ai/flows/generate-teacher-report';
import { useRef } from 'react';

function safeDate(dateStr: string | number | Date): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  // Try standard parsing first (ISO, YYYY-MM-DD, etc)
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // Handle DD/MM/YYYY, HH:mm:ss format from Google Sheets
  if (typeof dateStr === 'string') {
    // Regex for dd/mm/yyyy with optional time
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

  // Fallback for other invalid strings
  return new Date(); 
}

function generateReportHtml(checkIn: StudentCheckIn, aiReport: string) {
    const initialEmotion = emotions.find(e => e.id === checkIn.emotion);
    const postCoolDownEmotion = checkIn.postCoolDownEmotion ? emotions.find(e => e.id === checkIn.postCoolDownEmotion) : null;
    const formattedDate = new Intl.DateTimeFormat('en-GB', { 
        timeZone: 'Asia/Kuala_Lumpur', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    }).format(safeDate(checkIn.date));
    
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Check-in Report: ${checkIn.student}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #000; max-width: 800px; margin: 20px auto; padding: 20px; text-align: left; }
          .container { border: 2px solid #359055; border-radius: 12px; padding: 30px; background: #fff; }
          h1 { color: #359055; font-size: 28px; border-bottom: 3px solid #359055; padding-bottom: 10px; text-align: center; }
          h2 { font-size: 20px; margin-top: 25px; color: #256030; border-left: 5px solid #359055; padding-left: 10px; }
          .meta-info { background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; margin-bottom: 25px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .meta-info p { margin: 0; }
          .report-section { margin-bottom: 25px; }
          .report-section p { margin: 8px 0; }
          .ai-report { background-color: #fffbeb; border: 2px dashed #fcd34d; padding: 20px; border-radius: 8px; white-space: pre-line; color: #000; font-size: 16.5px; text-align: left; line-height: 1.8; }
          strong { color: #000; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 0; }
            .container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print" style="text-align: right; margin-bottom: 10px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #359055; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Print to PDF / 打印为 PDF</button>
          </div>
          <h1>Student Check-in Report / 学生签到报告</h1>
          
          <div class="meta-info">
            <p><strong>Student / 学生:</strong> ${checkIn.student}</p>
            <p><strong>Date / 日期:</strong> ${formattedDate}</p>
            <p><strong>Initial Emotion / 初始情绪:</strong> ${initialEmotion?.emoji} ${initialEmotion?.name.en} / ${initialEmotion?.name.zh}</p>
            <p><strong>Intensity / 强度:</strong> ${checkIn.intensity} / 10</p>
          </div>

          <div class="report-section">
            <h2>What Happened / 发生了什么</h2>
            <p>${checkIn.description || 'No description provided. / 未提供描述。'}</p>
          </div>

          <div class="report-section">
            <h2>Body Scan / 身体扫描</h2>
            <p>${checkIn.bodyScan.length > 0 ? checkIn.bodyScan.join(', ') : 'No specific body sensations noted. / 未记录特定的身体感觉。'}</p>
          </div>

          <div class="report-section">
            <h2>Needs & Hopes / 需求与希望</h2>
            <div style="padding-left: 10px;">
              <p><strong>Need / 需求:</strong> ${checkIn.needs.need || '-'}</p>
              <p><strong>Hope / 希望:</strong> ${checkIn.needs.hope || '-'}</p>
              <p><strong>Care / 照顾:</strong> ${checkIn.needs.selfCare || '-'}</p>
            </div>
          </div>
          
          ${postCoolDownEmotion ? `
          <div class="report-section">
            <h2>Regulation Progress / 调节进度</h2>
            <div style="padding-left: 10px;">
              <p><strong>Post-Emotion / 最终情绪:</strong> ${postCoolDownEmotion.emoji} ${postCoolDownEmotion.name.en} / ${postCoolDownEmotion.name.zh}</p>
              <p><strong>New Intensity / 新强度:</strong> ${checkIn.postCoolDownIntensity} / 10</p>
            </div>
          </div>
          ` : ''}

          <div class="report-section">
            <h2>Generated Report / 报告</h2>
            <div class="ai-report">${aiReport.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    return reportHtml;
}

function ReportGenerator({ checkIn }: { checkIn: StudentCheckIn }) {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const hasFetched = useRef<string | null>(null);
  
    useEffect(() => {
      const reportKey = `${checkIn.student}-${checkIn.date}`;
      if (hasFetched.current === reportKey || report) return;

      const fetchReport = async () => {
        setIsLoading(true);
        hasFetched.current = reportKey;
        try {
          const emotionName = emotions.find(e => e.id === checkIn.emotion)?.name.en || checkIn.emotion;
          const postCoolDownEmotionName = checkIn.postCoolDownEmotion ? emotions.find(e => e.id === checkIn.postCoolDownEmotion)?.name.en : undefined;
          
          const result = await generateTeacherReport({
              studentName: checkIn.student,
              emotion: emotionName,
              intensity: checkIn.intensity,
              description: checkIn.description,
              bodyScan: checkIn.bodyScan,
              needs: checkIn.needs,
              postCoolDownEmotion: postCoolDownEmotionName,
              postCoolDownIntensity: checkIn.postCoolDownIntensity,
          });
          setReport(result.report);
        } catch (error) {
          console.error("Failed to generate report", error);
          setReport("Could not load AI-generated report.\n无法加载AI报告。");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchReport();
    }, [checkIn.student, checkIn.date, checkIn.emotion]);

    const handleDownloadReport = () => {
        if (isLoading) {
            toast({
                title: "Please wait",
                description: "Generating report...",
            });
            return;
        }
        const reportHtml = generateReportHtml(checkIn, report);
        const newWindow = window.open();
        newWindow?.document.write(reportHtml);
        newWindow?.document.close();
    }
  
    return (
        <Card className="shadow-md animate-in fade-in duration-500 my-4 bg-primary/5 border-primary/20">
        <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="text-left">
                    <CardTitle className="font-bold text-lg flex items-center gap-2 text-primary">
                        My Emotional Analysis / 情绪分析报告
                    </CardTitle>
                </div>
                <Button variant="default" size="sm" className="flex gap-2" onClick={handleDownloadReport}>
                    <Printer className="w-4 h-4" />
                    Download Report / 下载报告
                </Button>
            </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ) : (
                <div className="text-black text-left text-sm whitespace-pre-line bg-white p-4 rounded-xl border border-primary/10">
                    <p>{report}</p>
                </div>
            )}
        </CardContent>
      </Card>
    );
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
                   <ReportGenerator checkIn={checkin} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
