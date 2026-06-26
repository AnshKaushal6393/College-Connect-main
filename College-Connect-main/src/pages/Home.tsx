import { Link } from "react-router-dom";
import { 
  Users, 
  Code2, 
  BookOpen, 
  Network, 
  Trophy, 
  Rocket,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  ArrowRight,
  Zap,
  Target,
  Star,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

interface FeatureCardProps {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  link: string;
}

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const FeatureCard: FC<FeatureCardProps> = ({ Icon, title, description, color, link }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="group relative"
  >
    <Link to={link} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-200">
        <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
          Learn more 
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const StatCard: FC<{ value: string; label: string; icon: React.ComponentType<{ className?: string }> }> = ({ 
  value, 
  label, 
  icon: Icon 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100"
  >
    <Icon className="h-8 w-8 text-indigo-600 mb-3" />
    <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">
      {value}
    </div>
    <div className="text-gray-600 text-sm md:text-base text-center">{label}</div>
  </motion.div>
);

const TestimonialCard: FC<TestimonialProps> = ({ name, role, content, avatar, rating }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-gray-600 italic mb-6">"{content}"</p>
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

const Home: FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    hackathons: 0,
    resources: 0,
    teams: 0
  });
  const [loading, setLoading] = useState(true);

  const API_URL = API_BASE_URL;

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [adminStats, resourceStats] = await Promise.all([
          axios.get(`${API_URL}/admin/stats`, { withCredentials: true }).catch(() => ({ data: { stats: {} } })),
          axios.get(`${API_URL}/resources/stats`).catch(() => ({ data: { stats: {} } }))
        ]);

        setStats({
          totalUsers: adminStats.data?.stats?.totalUsers || 500,
          hackathons: 50,
          resources: resourceStats.data?.stats?.totalResources || 1000,
          teams: 150
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  const features = [
    {
      icon: Users,
      title: "Team Building",
      description: "Find the perfect teammates for hackathons with AI-powered matching based on skills and interests.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      link: "/team-builder"
    },
    {
      icon: Code2,
      title: "Hackathon Hub",
      description: "Discover, register, and participate in upcoming hackathons. Track your journey and win prizes.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      link: "/hackathons"
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description: "Access curated notes, books, and tutorials shared by students and seniors.",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      link: "/resources"
    },
    {
      icon: Network,
      title: "Alumni Network",
      description: "Connect with successful alumni for mentorship, career guidance, and networking opportunities.",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      link: "/alumni"
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "CS Student, KIET",
      content: "Found my dream hackathon team here! Won 1st prize at TechFest 2024. The platform made networking so easy.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Alumni, Class of 2023",
      content: "As an alumni, I love mentoring students through this platform. It's amazing to give back to the community.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      rating: 5
    },
    {
      name: "Sneha Patel",
      role: "Senior, IT Department",
      content: "The resource sharing feature is a lifesaver! Helped me prepare for interviews and land my dream job.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      rating: 5
    }
  ];

  const benefits = [
    "Verified student community",
    "Real-time collaboration tools",
    "Mentor matching system",
    "Achievement tracking",
    "Career guidance resources",
    "Project showcase platform"
  ];

  return (
    <div className="space-y-20 px-4 sm:px-6 lg:px-8 pb-16">
      {/* Hero Section */}
      <section className="pt-20 pb-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-medium"
          >
            <Zap className="h-4 w-4" />
            <span>Join 500+ Students Already Connected</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Connect. <span className="text-indigo-600">Collaborate.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Conquer Together.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your all-in-one platform to find hackathon teammates, connect with mentors, 
            share resources, and build your college network.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-4">
            {!currentUser ? (
              <>
                <Link
                  to="/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <Rocket className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 text-lg font-semibold"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/team-builder"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg font-semibold"
                >
                  Find Teammates
                </Link>
                <Link
                  to="/hackathons"
                  className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 text-lg font-semibold"
                >
                  Browse Hackathons
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Verified Students Only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Admin Moderated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>100% Free</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Our Growing <span className="text-indigo-600">Community</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard icon={Users} value={`${stats.totalUsers}+`} label="Active Students" />
            <StatCard icon={Trophy} value={`${stats.hackathons}+`} label="Hackathons" />
            <StatCard icon={BookOpen} value={`${stats.resources}+`} label="Resources Shared" />
            <StatCard icon={Rocket} value={`${stats.teams}+`} label="Teams Formed" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
            Everything You Need to <span className="text-indigo-600">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive ecosystem designed for student collaboration and growth
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              Icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              link={feature.link}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
              Why Choose CollegeConnect
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Built by Students, <br />for <span className="text-indigo-600">Students</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We understand the challenges of finding the right team, accessing quality resources, 
              and connecting with mentors. That's why we created a platform that solves all these problems in one place.
            </p>
            <Link
              to={currentUser ? "/profile" : "/signup"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              {currentUser ? "View Your Profile" : "Join Now"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
            Student Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
            What Our <span className="text-indigo-600">Community</span> Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from students who found success through CollegeConnect
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            
            <div className="relative z-10">
              <Award className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Level Up Your College Experience?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of students who are already collaborating, learning, and growing together.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg font-bold"
              >
                Create Free Account
                <Target className="h-5 w-5" />
              </Link>
              <p className="mt-6 text-sm opacity-75">
                No credit card required • Takes less than 2 minutes
              </p>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

// Add this to your global CSS (tailwind.config.js or global.css)
const styles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;

export default Home;
