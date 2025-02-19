import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-100/50 via-background to-purple-100/50 
      dark:from-indigo-950/50 dark:via-background dark:to-purple-950/50"
    >
      <div className="flex z-10 fixed top-4 right-4 scale-110">
        <ThemeSwitcher />
      </div>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br 
          from-primary/5 to-transparent rounded-full blur-3xl"
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl 
          from-primary/5 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
        <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
          {/* Main Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-foreground 
            tracking-tight [text-wrap:balance] opacity-0 animate-[fadeIn_1s_ease-in_forwards]"
          >
            Validate Your Business Ideas
            <span className="text-primary block mt-2">With Confidence</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-center text-muted-foreground max-w-2xl 
            [text-wrap:balance] leading-relaxed opacity-0 animate-[fadeIn_1s_ease-in_0.5s_forwards]"
          >
            Transform your business concepts into validated opportunities
            through structured feedback and data-driven insights
          </p>
          {/* CTA Button */}
          <Button
            size="lg"
            className="inline-flex text-2xl h-14 relative animate-shimmer items-center justify-center rounded-md border border-slate-800 dark:border-slate-100 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <Link href="/login">Get Started For Free</Link>
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-20">
          {/* Card 1 */}
          <div
            className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50
            hover:border-primary/20 hover:bg-card transition-all duration-300
            opacity-0 animate-[fadeIn_1s_ease-in_1.5s_forwards] shadow-lg hover:shadow-xl dark:shadow-white/10"
          >
            <div className="text-primary text-2xl mb-4 transition-transform duration-300">
              🎯
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">
              Create Polls
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Design structured polls with predefined answers to gather focused
              feedback from your target audience
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50
            hover:border-primary/20 hover:bg-card transition-all duration-300
            opacity-0 animate-[fadeIn_1s_ease-in_1.75s_forwards] shadow-lg hover:shadow-xl dark:shadow-white/10"
          >
            <div className="text-primary text-2xl mb-4 transition-transform duration-300">
              🔄
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">
              Link Sequences
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Create comprehensive validation flows by connecting multiple polls
              in a strategic sequence
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="group bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50
            hover:border-primary/20 hover:bg-card transition-all duration-300
            sm:col-span-2 lg:col-span-1 opacity-0 animate-[fadeIn_1s_ease-in_2s_forwards] shadow-lg hover:shadow-xl dark:shadow-white/10"
          >
            <div className="text-primary text-2xl mb-4 transition-transform duration-300">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">
              Track Responses
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Make informed decisions with real-time analytics and comprehensive
              response tracking
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
