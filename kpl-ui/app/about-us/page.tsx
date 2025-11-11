import SplashBackground from "@/components/SplashBackground";

export default function About() {
  return (<>
    <main className=" flex items-center justify-center min-h-screen">
      <SplashBackground />
      <div className="relative bg-white p-8 rounded-lg shadow-lg max-w-4xl text-center gradient-shadow">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About Us</h1>
        <p className="text-gray-600 text-lg mb-6">
          We are a passionate team of developers dedicated to building an
          innovative
          <span className="font-semibold text-blue-500">&nbsp;Auction app</span>. Our
          mission is to create an engaging and immersive experience for users,
          where strategy, skill, and excitement come together.
        </p>
        <p className="text-gray-600 text-lg mb-6">
          Stay tuned for exciting updates as we continue to develop and enhance
          the app to meet the needs of our community!
        </p>
        <footer className="text-gray-500 font-medium mt-6">
          © 2025 All rights reserved.
        </footer>
      </div>
    </main>
  </>);
}
