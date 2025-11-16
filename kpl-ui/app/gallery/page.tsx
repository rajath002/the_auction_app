import SplashBackground from "@/components/SplashBackground";

export default function Gallery() {
  return (
    <>
      <main className="flex items-center justify-center min-h-screen">
        <SplashBackground />
        <div className="relative isolate overflow-hidden rounded-[28px] border border-slate-800/60 bg-slate-950/90 px-8 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur max-w-4xl text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-white mb-6">Gallery</h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Welcome to our gallery! Here you can explore images and media related to our
              <span className="font-semibold text-blue-400">&nbsp;Auction app</span>. Discover
              the highlights, team moments, and exciting events from our platform.
            </p>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              This gallery showcases the vibrant community and memorable experiences
              that make our auction platform special.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {/* Placeholder for gallery items */}
              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Team Photos</h3>
                <p className="text-slate-400 text-sm">Coming soon...</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Auction Highlights</h3>
                <p className="text-slate-400 text-sm">Coming soon...</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Event Gallery</h3>
                <p className="text-slate-400 text-sm">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}