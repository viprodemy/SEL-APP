'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsSubmitting(true);
    setError(null);

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password. / 用户名或密码错误。');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-4"
    >
      <Card className="shadow-2xl rounded-3xl overflow-hidden border-2 border-primary/10">
        <CardHeader className="bg-primary/5 p-8 text-center">
          <CardTitle className="text-3xl font-headline font-extrabold text-primary">Login / 登入</CardTitle>
          <p className="text-muted-foreground mt-2">Sign in to start your check-in.</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-destructive w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-lg font-bold text-primary">Username / 用户名</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 focus:border-primary text-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-bold text-primary">Password / 密码</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 focus:border-primary text-lg"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-16 rounded-full text-xl font-bold btn-glossy shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login / 登入'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="text-center mt-8 text-muted-foreground font-medium">
        Contact your teacher if you forgot your password.<br />
        如果忘记密码值，请联系老师。
      </p>
    </motion.div>
  );
}
