import EmotionCheckInFlow from '@/components/sel/emotion-check-in-flow';

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center px-4 md:px-6 py-12 md:py-24">
      <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary mb-4 md:mb-6 animate-bloom leading-tight">
        🌱 PSL Mind Sprout
      </h1>
      <div className="text-muted-foreground text-lg md:text-xl mb-8 md:mb-12 max-w-2xl px-2">
        <p>Your safe space to explore feelings.</p>
        <p>Ready to check in and see how you’re doing today?</p>
        <p className="text-sm md:text-base mt-4 border-t pt-4 border-primary/10">这里是探索情绪的安全小天地。准备好看看今天感觉如何了吗？</p>
      </div>
      <div className="w-full flex justify-center">
        <EmotionCheckInFlow />
      </div>
    </div>
  );
}
