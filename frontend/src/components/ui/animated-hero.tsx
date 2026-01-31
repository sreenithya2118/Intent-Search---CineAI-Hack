import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smart", "natural", "simple", "fast", "easy"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full hero-wrapper">
      <div className="container mx-auto">
        <div className="flex gap-10 py-24 lg:py-44 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
              <a href="#how-it-works">
                How it works <MoveRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <div className="flex gap-6 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-normal leading-tight">
              <span className="text-foreground">Video search, </span>
              <span
                className="hero-rotating-word-container"
                style={{ minHeight: '1.15em', display: 'inline-block', verticalAlign: 'bottom' }}
              >
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="hero-rotating-word"
                    style={{ left: '50%', x: '-50%' }}
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 80, damping: 18 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -20 : 20, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="text-foreground"> -powered.</span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center space-y-2">
              <span className="block">
                Paste a YouTube link. We turn the video into searchable moments.
              </span>
              <span className="block">
                Search with your own words—like “before the goal” or “when they celebrate.” Get short clips and clear answers.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
