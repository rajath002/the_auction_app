import SplashBackground from "@/components/SplashBackground";

export default function About() {
  return (<>
    <main className=" flex items-center justify-center min-h-screen">
      <SplashBackground />
      <div className="relative isolate overflow-hidden rounded-[28px] border border-slate-800/60 bg-slate-950/90 px-8 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur max-w-4xl text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-6">About Us</h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            We are a passionate team of developers dedicated to building an
            innovative
            <span className="font-semibold text-blue-400">&nbsp;Auction app</span>. Our
            mission is to create an engaging and immersive experience for users,
            where strategy, skill, and excitement come together.
          </p>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Stay tuned for exciting updates as we continue to develop and enhance
            the app to meet the needs of our community!
          </p>
          <footer className="text-slate-400 font-medium mt-8 text-sm">
            © 2025 All rights reserved.
          </footer>
        </div>
      </div>
    </main>
  </>);
}
