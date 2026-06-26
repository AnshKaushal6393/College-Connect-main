// src/components/Footer.tsx
import { Github, Twitter, ArrowUp, MailIcon, Heart, Users, Instagram, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative mt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 ">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
              <span className="font-bold text-lg sm:text-xl text-gray-900">CollegeConnect</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Empowering students to connect, collaborate, and succeed together. Your journey starts here.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://github.com/collegeconnect-web" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-md border border-gray-200 transition-all duration-300">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/college_cnct_hq?igsh=bWUzdGZtMXJ0MDRy" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-md border border-gray-200 transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/college_cnct_hq?s=21" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-md border border-gray-200 transition-all duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:collegeconnect2k24@gmail.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:shadow-md border border-gray-200 transition-all duration-300">
                <MailIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="ml-24">
            <h4 className="text-gray-900 font-semibold text-xl mb-4">Platform</h4>
            <ul className="space-y-3">
              {[
                { name: "Team Builder", to: "/team-builder" },
                { name: "Hackathons", to: "/hackathons" },
                { name: "Resources", to: "/resources" },
                { name: "Alumni Network", to: "/alumni" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.to}
                    className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-indigo-600 transition-colors"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback Box */}
<div className="md:col-span-2 flex flex-col items-start ml-10">
  <h4 className="text-gray-900 font-semibold text-xl mb-4">
    💬 We’d love your feedback!
  </h4>
  <p className="text-gray-600 text-sm mb-4">
    Got an idea, issue, or suggestion? Share it with us — we’re always listening.
  </p>

  <form
    action="https://formspree.io/f/xeoprywr"  // 🔹 your Formspree endpoint
    method="POST"
    className="flex flex-col w-full max-w-md gap-3"
  >
    {/* Name field */}
    <input
      type="text"
      name="name"
      placeholder="Your Name"
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
      required
    />

    {/* Email field */}
    <input
      type="email"
      name="email"
      placeholder="Your Email"
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
      required
    />

    {/* Feedback message */}
    <textarea
      name="message"
      placeholder="Type your feedback..."
      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm h-24"
      required
    ></textarea>

    <button
      type="submit"
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-indigo-700 transition-all text-sm"
    >
      <Send className="h-4 w-4" /> Send
    </button>
  </form>

  <p className="text-gray-400 text-xs mt-3 italic">
    Your feedback helps us improve College Connect 🌐
  </p>
</div>


        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 text-center md:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-indigo-600">CollegeConnect</span>. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by students, for students
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
