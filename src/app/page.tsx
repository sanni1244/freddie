import Image from "next/image";
import "./styles/hero.css";
import Logo from "./components/logo";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        <nav className="flex justify-between items-center p-4">
          <span className="flex items-center gap-2">
            <Logo />
            <b>portfolio</b>
          </span>
          <span className="flex gap-4">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </span>
          <Link href="/switch">Switch</Link>

        </nav>
      </header>
      <main>
        <div className="hero-section flex justify-around items-center p-4">
          <div className="hero-content w-2/5 bg-gray-900 text-white flex flex-col justify-center items-start p-12">





              {/* Logo or Initials */}
              <div className="mb-8">
                <div className="text-3xl font-bold flex items-center gap-2"><Logo /> O.S</div> 
              </div>

              {/* Name */}
              <h1 className="text-5xl font-extrabold mb-4">Opeyemi Sanni</h1>

              {/* Title */}
              <h2 className="">
                Full Stack Developer | Data Analyst | AI Enthusiast
              </h2>

              {/* Short Intro */}
              <p className="text-lg text-gray-400 leading-relaxed">
                Passionate about building intelligent, scalable, and user-friendly applications. Exploring the intersection of AI and software development.
              </p>

              {/* Optional: Buttons */}
              <div className="mt-8 flex space-x-4">
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition">
                  Contact Me
                </button>
                <button className="border border-white px-6 py-2 rounded-full font-semibold hover:bg-gray-700 transition">
                  Portfolio
                </button>
              </div>

            </div>
            <div className="hero-image">
              <Image
                src="/images/devimg.png"
                alt="Hero Image"
                width={400}
                height={400}
                priority
                className="me-image"
              />
            </div>
          </div>
      </main>
    </>
  );
}
