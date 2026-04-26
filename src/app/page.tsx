import EmotionCheckInFlow from '@/components/sel/emotion-check-in-flow';

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-center text-5xl font-headline font-extrabold text-primary mb-4 animate-bloom">
        🌱 PSL Mind Sprout
      </h1>
      <div className="text-muted-foreground text-xl mb-8 max-w-2xl">
        <p>Your safe space to explore feelings.</p>
        <p>Ready to check in and see how you’re doing today?</p>
        <p className="text-base mt-2">这里是探索情绪的安全小天地。准备好看看今天感觉如何了吗？</p>
      </div>
      <EmotionCheckInFlow />
    </div>
  );
}
