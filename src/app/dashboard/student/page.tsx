
'use client';

import { useUserProgress } from '@/lib/hooks/use-user-progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { rewards, emotions } from '@/lib/data';
import { Sparkles, Trophy, Calendar, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function StudentDashboardPage() {
  const { progress, isLoaded } = useUserProgress();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-xl font-headline animate-pulse">Growing your mindful garden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6">
          <h1 className="text-4xl font-headline font-bold text-primary">My Mindful Progress</h1>
          <p className="text-xl text-muted-foreground">Keep checking in to grow your mindful garden!</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress.currentStreak} Days</div>
                <p className="text-xs text-muted-foreground">Don't break the chain!</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                <Trophy className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{progress.longestStreak} Days</div>
                <p className="text-xs text-muted-foreground">Your personal record!</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Next Milestone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {rewards.map((reward, idx) => {
                 const isCompleted = progress.currentStreak >= reward.streak;
                 const isCurrent = !isCompleted && (idx === 0 || progress.currentStreak >= rewards[idx-1].streak);
                 
                 if (isCurrent) {
                    const progressValue = (progress.currentStreak / reward.streak) * 100;
                    return (
                        <div key={reward.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{reward.name.en} ({reward.name.zh})</span>
                                <span>{progress.currentStreak}/{reward.streak}</span>
                            </div>
                            <Progress value={progressValue} className="h-2" />
                            <p className="text-xs text-muted-foreground">{reward.description.en}</p>
                        </div>
                    )
                 }
                 return null;
               })}
            </CardContent>
          </Card>
        </div>

        <Card className="w-full md:w-80">
          <CardHeader>
            <CardTitle>My Badges</CardTitle>
            <CardDescription>Badges you've earned.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             {rewards.map(reward => {
                const isEarned = progress.badges.includes(reward.id);
                const Icon = reward.icon;
                return (
                  <div key={reward.id} className={cn(
                      "flex flex-col items-center p-3 rounded-xl border transition-all",
                      isEarned ? "bg-accent/10 border-accent" : "opacity-30 grayscale"
                  )}>
                    <Icon className={cn("w-10 h-10 mb-2", isEarned ? "text-accent" : "text-muted-foreground")} />
                    <span className="text-[10px] text-center font-bold leading-tight">{reward.name.en}</span>
                  </div>
                )
             })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Check-in History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.checkIns.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No check-ins yet. Let's start one!</p>
          ) : (
            <div className="space-y-4">
               {[...progress.checkIns].reverse().slice(0, 10).map((checkin, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{emotions.find(e => e.id === checkin.emotionId)?.emoji}</span>
                     <div>
                       <p className="font-bold">{emotions.find(e => e.id === checkin.emotionId)?.name.en}</p>
                       <p className="text-xs text-muted-foreground">{format(new Date(checkin.date), 'PPP')}</p>
                     </div>
                   </div>
                   <Badge variant="secondary">Intensity: {checkin.intensity}</Badge>
                 </div>
               ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
