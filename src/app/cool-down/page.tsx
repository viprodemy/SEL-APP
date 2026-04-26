import CoolDownZone from '@/components/sel/cool-down-zone';

export default function CoolDownPage() {
  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-2">Cool Down Zone</h1>
      <p className="text-muted-foreground mb-8">Find a calm moment with these exercises.</p>
      <CoolDownZone />
    </div>
  );
}
