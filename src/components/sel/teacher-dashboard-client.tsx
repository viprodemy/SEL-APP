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

function generateReportHtml(checkIn: StudentCheckIn, aiReport: string) {
    const initialEmotion = emotions.find(e => e.id === checkIn.emotion);
    const postCoolDownEmotion = checkIn.postCoolDownEmotion ? emotions.find(e => e.id === checkIn.postCoolDownEmotion) : null;
    
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
          .ai-report { background-color: #fffbeb; border: 2px dashed #fcd34d; padding: 20px; border-radius: 8px; white-space: pre-line; color: #000; font-size: 16px; text-align: left; }
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
            <p><strong>Date / 日期:</strong> ${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(checkIn.date))}</p>
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
            <p><strong>Need / 需求:</strong> ${checkIn.needs.need || 'Not specified'}</p>
            <p><strong>Hope / 希望:</strong> ${checkIn.needs.hope || 'Not specified'}</p>
            <p><strong>Self-Care / 自我照顾:</strong> ${checkIn.needs.selfCare || 'Not specified'}</p>
          </div>
          
          ${postCoolDownEmotion ? `
          <div class="report-section">
            <h2>After Cool-Down Exercise / 练习之后</h2>
            <p><strong>Final Emotion / 最终情绪:</strong> ${postCoolDownEmotion.emoji} ${postCoolDownEmotion.name.en} / ${postCoolDownEmotion.name.zh}</p>
            <p><strong>Final Intensity / 最终强度:</strong> ${checkIn.postCoolDownIntensity} / 10</p>
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
              need: normalizedRow.needs?.split('Hope:')[0]?.replace('Need:', '').trim() || '',
              hope: normalizedRow.needs?.split('Hope:')[1]?.split('Care:')[0]?.trim() || '',
              selfCare: normalizedRow.needs?.split('Care:')[1]?.trim() || ''
            },
            postCoolDownEmotion: normalizedRow.postemotion || row.postEmotion || '',
            postCoolDownIntensity: Number(normalizedRow.postintensity || row.postIntensity || 0)
          };
        });

        // Sort by date desc
        mappedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        isSameDay(new Date(checkin.date), searchDate)
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
          format(new Date(c.date), 'yyyy-MM-dd HH:mm'),
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
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left w-full">
            <CardTitle>Search Records / 搜索记录</CardTitle>
            <CardDescription>Filter by name or date.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="whitespace-nowrap flex gap-2">
              <Download className="w-4 h-4" />
              Export to CSV / 导出表格
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid w-full sm:w-auto sm:flex-1 gap-1.5 text-left">
            <Label>Student Name</Label>
            <Input
              placeholder="Search student..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="grid w-full sm:w-auto gap-1.5 text-left">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('w-full sm:w-[240px] justify-start text-left font-normal', !searchDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={searchDate} onSelect={setSearchDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {checkinsLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredCheckins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No records found.</div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredCheckins.map((checkin, index) => {
                const emotion = emotions.find(e => e.id === checkin.emotion);
                const postCoolDownEmotion = checkin.postCoolDownEmotion ? emotions.find(e => e.id === checkin.postCoolDownEmotion) : null;

                return (
                  <AccordionItem value={`item-${index}`} key={checkin.id || index} className="border-b px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 w-full text-left">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${checkin.student}`} />
                          <AvatarFallback>{checkin.student.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <p className="text-black font-bold">{checkin.student}</p>
                          <p className="text-sm font-normal text-muted-foreground">{klFormatter.format(new Date(checkin.date))}</p>
                        </div>
                        <div className="flex items-center gap-2 pr-4">
                            <span className="text-3xl">{emotion?.emoji}</span>
                            {postCoolDownEmotion && <><Wind className="w-4 h-4" /><span className="text-3xl">{postCoolDownEmotion?.emoji}</span></>}
                            <Badge variant="secondary">Intensity: {checkin.intensity}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/20 rounded-lg mb-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <CheckinDetail icon={User} title="What Happened" title_zh="发生了什么">
                          <p className="bg-white p-3 rounded border text-black text-left">{checkin.description || 'N/A'}</p>
                        </CheckinDetail>

                        <CheckinDetail icon={Activity} title="Body Scan" title_zh="身体扫描">
                          <div className="flex flex-wrap gap-2">
                             {checkin.bodyScan.map(part => <Badge variant="outline" className="bg-white text-black" key={part}>{part}</Badge>)}
                          </div>
                        </CheckinDetail>

                        <CheckinDetail icon={Heart} title="Needs & Hopes" title_zh="需求与希望">
                          <div className="space-y-1 bg-white p-3 rounded border text-sm text-black text-left">
                            <p><strong>Need / 需求:</strong> {checkin.needs.need}</p>
                            <p><strong>Hope / 希望:</strong> {checkin.needs.hope}</p>
                            <p><strong>Self-Care / 自我照顾:</strong> {checkin.needs.selfCare}</p>
                          </div>
                        </CheckinDetail>

                        {postCoolDownEmotion && (
                          <CheckinDetail icon={Smile} title="After Cool-down" title_zh="练习之后">
                            <div className="bg-white p-3 rounded border text-black text-left">
                               <p><strong>Emotion:</strong> {postCoolDownEmotion.name.en} (Intensity: {checkin.postCoolDownIntensity})</p>
                          <p className="text-xs text-muted-foreground mt-2">Recorded at: {klFormatter.format(new Date(checkin.date))}</p>
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
