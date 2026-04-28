"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import { emotions } from '@/lib/data';
import type { StudentCheckIn } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { format, isSameDay } from 'date-fns';
import { generateTeacherReport } from '@/ai/flows/generate-teacher-report';
import { Clipboard, GraduationCap, Heart, User, Activity, CalendarIcon, Smile, Wind, Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
// import { collection, query, orderBy } from 'firebase/firestore'; // Removing Firebase
// import { useFirestore, useCollection } from '@/firebase';

function safeDate(dateStr: string | number | Date): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try to handle dd/mm/yyyy or common sheet formats if basic Date fails
    console.warn("Invalid date string encountered:", dateStr);
    return new Date(); 
  }
  return d;
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
        <title>Student Check-in Report: ${checkIn.student}</title>
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
    
    // Use a secondary ref to prevent double-firing in StrictMode or rapid re-renders
    const hasFetched = useRef(false);
  
    useEffect(() => {
      // If we already have a report or are loading, don't start again
      // Use the student name and date as a unique key to prevent redundant calls
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
          console.error("Failed to generate teacher report", error);
          setReport("Could not load AI-generated report.\n无法加载AI报告。");
          hasFetched.current = false; // Allow retry if it failed
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchReport();
    }, [checkIn.student, checkIn.date, checkIn.emotion]); // Use primitives instead of object reference

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
        <Card className="shadow-lg animate-in fade-in duration-500 my-4 bg-primary/5 border-primary/20">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="text-left">
                    <CardTitle className="font-headline text-xl flex items-center gap-3 text-primary">
                        <GraduationCap className="w-6 h-6" />
                        Generated Report / 报告
                    </CardTitle>
                    <CardDescription>Actionable insights for {checkIn.student}.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="default" className="btn-glossy flex gap-2" onClick={handleDownloadReport}>
                        <Printer className="w-4 h-4" />
                        Download Report / 下载报告
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ) : (
                <div className="text-black text-left whitespace-pre-line bg-white p-4 rounded-lg border border-primary/10">
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

import { fetchCheckinsFromSheets } from '@/lib/sheets-fetch';

export default function TeacherDashboardClient() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [allCheckins, setAllCheckins] = useState<StudentCheckIn[]>([]);
  const [checkinsLoading, setCheckinsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchFromSheets() {
      setCheckinsLoading(true);
      try {
        const result = await fetchCheckinsFromSheets();
        
        if (!result.success || !result.data) {
          console.error("Sheets fetch failed:", result.error);
          setCheckinsLoading(false);
          return;
        }

        const rawData = result.data;
        
        // Map flat Google Sheets data to StudentCheckIn type
        const mappedData: StudentCheckIn[] = rawData.map((row: any, index: number) => {
          // Normalize row keys to lowercase for easier matching
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            normalizedRow[key.toLowerCase().replace(/[\s_]/g, '')] = row[key];
          });

          return {
            id: `${normalizedRow.studentname || 'student'}_${normalizedRow.date || normalizedRow.timestamp || index}`,
            student: normalizedRow.studentname || normalizedRow.student || row.Student || row['Student Name'] || row.Name || row['姓名'] || row['名字'] || 'Unknown',
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
        });

        // Sort by date desc
        mappedData.sort((a, b) => safeDate(b.date).getTime() - safeDate(a.date).getTime());
        setAllCheckins(mappedData);
      } catch (error) {
        console.error("Error fetching from sheets:", error);
      } finally {
        setCheckinsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchFromSheets();
    }
  }, [isAuthenticated]);

  const klFormatter = useMemo(() => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }), []);

  const filteredCheckins = useMemo(() => {
    if (!allCheckins) return [];
    let results = allCheckins;

    if (searchName) {
      results = results.filter(checkin =>
        checkin.student.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDate) {
      results = results.filter(checkin =>
        isSameDay(safeDate(checkin.date), searchDate)
      );
    }
    
    return results;
  }, [allCheckins, searchName, searchDate]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthenticated(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Incorrect password.',
      });
      setPassword('');
    }
  };

  const handleExportCSV = () => {
      if (filteredCheckins.length === 0) return;
      
      const headers = ["Student", "Date", "Emotion", "Intensity", "Description", "Body Scan", "Need", "Hope", "Self-Care"];
      const rows = filteredCheckins.map(c => [
          c.student,
          format(safeDate(c.date), 'yyyy-MM-dd HH:mm'),
          c.emotion,
          c.intensity,
          `"${c.description.replace(/"/g, '""')}"`,
          `"${c.bodyScan.join(', ')}"`,
          `"${c.needs.need.replace(/"/g, '""')}"`,
          `"${c.needs.hope.replace(/"/g, '""')}"`,
          `"${c.needs.selfCare.replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `SEL_Checkins_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Teacher Access / 教师入口</CardTitle>
          <CardDescription>Enter password to view records.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password / 密码"
            />
            <Button type="submit" className="w-full">Unlock / 解锁</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 px-2 md:px-0">
      <Card className="shadow-xl rounded-3xl overflow-hidden border-2 border-primary/10">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary/5 p-6 md:p-10">
          <div className="text-left w-full space-y-1">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Search Records / 搜索记录</CardTitle>
            <CardDescription className="text-lg">Filter by name or date to find specific student insights.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto whitespace-nowrap flex gap-2 h-12 rounded-full border-2 border-primary/20 hover:bg-primary hover:text-white transition-all text-lg px-6">
              <Download className="w-5 h-5" />
              Export CSV / 导出表格
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 p-6 md:p-10 items-end">
          <div className="grid w-full md:flex-1 gap-2 text-left">
            <Label className="text-lg font-bold text-primary px-1">Student Name</Label>
            <Input
              placeholder="Search student..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="h-14 rounded-2xl text-lg px-6 border-2 focus:border-primary transition-all"
            />
          </div>
          <div className="grid w-full md:w-auto gap-2 text-left">
            <Label className="text-lg font-bold text-primary px-1">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('w-full md:w-[280px] h-14 justify-start text-left font-medium text-lg rounded-2xl border-2 px-6', !searchDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {searchDate ? format(searchDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl" align="end">
                <Calendar mode="single" selected={searchDate} onSelect={setSearchDate} initialFocus className="rounded-3xl" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl rounded-3xl overflow-hidden border-2 border-primary/10 mb-20">
        <CardContent className="p-0">
          {checkinsLoading ? (
            <div className="p-8 space-y-6">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          ) : filteredCheckins.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
                <Users className="w-20 h-20 mx-auto mb-4 opacity-10" />
                <p className="text-xl font-medium">No records found matching your search.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredCheckins.map((checkin, index) => {
                const emotion = emotions.find(e => e.id === checkin.emotion);
                const postCoolDownEmotion = checkin.postCoolDownEmotion ? emotions.find(e => e.id === checkin.postCoolDownEmotion) : null;

                return (
                  <AccordionItem value={`item-${index}`} key={checkin.id || index} className="border-b-2 border-primary/5 hover:bg-primary/5 transition-colors">
                    <AccordionTrigger className="hover:no-underline px-4 md:px-8 py-6 md:py-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full text-left">
                        <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-white shadow-xl ring-2 ring-primary/10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${checkin.student}`} />
                          <AvatarFallback className="text-2xl font-bold bg-primary/10">{checkin.student.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 space-y-1'>
                          <p className="text-xl md:text-2xl font-black text-foreground">{checkin.student}</p>
                          <p className="text-base md:text-lg font-medium text-foreground/70 flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {klFormatter.format(safeDate(checkin.date))}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 py-2 sm:py-0 w-full sm:w-auto justify-end border-t sm:border-0 border-primary/10 pt-4 sm:pt-0">
                            <div className="flex items-center gap-2">
                                <span className="text-4xl md:text-5xl drop-shadow-sm">{emotion?.emoji}</span>
                                {postCoolDownEmotion && (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                        <Wind className="w-6 h-6 text-primary animate-pulse" />
                                        <span className="text-4xl md:text-5xl drop-shadow-sm">{postCoolDownEmotion?.emoji}</span>
                                    </div>
                                )}
                            </div>
                            <Badge variant="secondary" className="px-4 py-2 rounded-full text-base font-bold bg-white border-2 border-primary/10 text-primary whitespace-nowrap">
                                Intensity: {checkin.intensity}/10
                            </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 md:p-10 space-y-8 bg-white/50 backdrop-blur-sm rounded-t-none">
                      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <CheckinDetail icon={User} title="What Happened" title_zh="发生了什么">
                          <p className="bg-white p-6 rounded-3xl border-2 border-primary/10 text-lg text-black leading-relaxed shadow-sm">{checkin.description || 'N/A'}</p>
                        </CheckinDetail>

                        <CheckinDetail icon={Activity} title="Body Scan" title_zh="身体扫描">
                          <div className="flex flex-wrap gap-3">
                             {checkin.bodyScan.map(part => (
                                <Badge variant="outline" className="bg-white text-primary text-base px-4 py-2 rounded-xl border-2 border-primary/10 font-bold" key={part}>
                                    {part}
                                </Badge>
                             ))}
                             {checkin.bodyScan.length === 0 && <p className="text-muted-foreground italic">No sensations recorded.</p>}
                          </div>
                        </CheckinDetail>

                        <CheckinDetail icon={Heart} title="Needs & Hopes" title_zh="需求与希望">
                          <div className="space-y-4 bg-white p-6 rounded-3xl border-2 border-primary/10 text-lg shadow-sm">
                            <div className="flex flex-col gap-1 border-b pb-3 border-primary/5">
                                <span className="text-sm font-bold text-primary opacity-60 uppercase tracking-wider">Need / 需求</span>
                                <p className="text-black font-medium">{checkin.needs.need || '-'}</p>
                            </div>
                            <div className="flex flex-col gap-1 border-b pb-3 border-primary/5">
                                <span className="text-sm font-bold text-primary opacity-60 uppercase tracking-wider">Hope / 希望</span>
                                <p className="text-black font-medium">{checkin.needs.hope || '-'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-primary opacity-60 uppercase tracking-wider">Self-Care / 自我照顾</span>
                                <p className="text-black font-medium">{checkin.needs.selfCare || '-'}</p>
                            </div>
                          </div>
                        </CheckinDetail>

                        {postCoolDownEmotion && (
                          <CheckinDetail icon={Smile} title="After Cool-down" title_zh="练习之后">
                            <div className="bg-primary/5 p-6 rounded-3xl border-2 border-accent/20 text-lg shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                    <Wind className="w-12 h-12" />
                                </div>
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-5xl">{postCoolDownEmotion.emoji}</span>
                                    <div>
                                        <p className="font-bold text-foreground text-xl">{postCoolDownEmotion.name.en}</p>
                                        <p className="text-foreground/60 text-sm font-bold uppercase tracking-widest">Post Cool-down</p>
                                    </div>
                                </div>
                                <p className="font-bold text-primary mt-4 py-2 border-t border-accent/10">
                                    Final Intensity: <span className="text-2xl underline">{checkin.postCoolDownIntensity}</span>/10
                                </p>
                            </div>
                          </CheckinDetail>
                        )}
                      </div>
                      <ReportGenerator checkIn={checkin} />
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
