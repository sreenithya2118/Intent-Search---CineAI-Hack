import { Link } from 'react-router-dom'
import { Hero } from '@/components/ui/animated-hero'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { Button } from '@/components/ui/button'
import { Video, MoveRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)',
        }}
      >
        <FlickeringGrid
          squareSize={4}
          gridGap={6}
          color="#60A5FA"
          maxOpacity={0.5}
          flickerChance={0.1}
          className="absolute inset-0 size-full"
        />
      </div>
      <div className="relative z-10">
        <Hero />
        <div className="container mx-auto px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-row gap-3 flex-wrap justify-center mt-8">
              <Button size="lg" className="gap-2" variant="outline" asChild>
                <Link to="/upload">
                  <Video className="w-4 h-4" /> Add a video
                </Link>
              </Button>
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                <Link to="/search">
                  Search now <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

