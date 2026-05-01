

export function Hero() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-[90vh]">
      <h1 
        className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
      </h1>
      
      <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
        We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
      </p>
      
      <button className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer">
        Begin Journey
      </button>
    </div>
  );
}
