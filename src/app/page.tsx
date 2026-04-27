'use client';

import EmotionCheckInFlow from '@/components/sel/emotion-check-in-flow';
import LoginForm from '@/components/sel/login-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading... / 载入中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center px-4 md:px-6 py-12 md:py-24">
      <div className="mb-8 md:mb-12">
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary mb-4 animate-bloom leading-tight">
          🌱 PSL Mind Sprout
        </h1>
        <div className="text-muted-foreground text-lg md:text-xl max-w-2xl px-2">
          <p>Your safe space to explore feelings.</p>
          <p>Ready to check in and see how you’re doing today?</p>
          <p className="text-sm md:text-base mt-4 border-t pt-4 border-primary/10">这里是探索情绪的安全小天地。准备好看看今天感觉如何了吗？</p>
        </div>
      </div>

      {!user ? (
        <LoginForm />
      ) : (
        <div className="w-full flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-full border border-primary/10">
            <p className="text-primary font-bold">Logged in as: {user} / 已登入为：{user}</p>
            <Button variant="ghost" size="sm" onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full flex gap-2">
              <LogOut className="w-4 h-4" />
              Logout / 登出
            </Button>
          </div>
          <div className="w-full flex justify-center">
            <EmotionCheckInFlow />
          </div>
        </div>
      )}
    </div>
  );
}
