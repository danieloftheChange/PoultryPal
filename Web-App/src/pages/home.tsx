import { Button } from '@/components/ui/button';
import { ArrowRight} from "lucide-react";
import Footer from '@/components/footer';
import Navbar from '@/components/navBar';
/**
 * HomePage
 *
 * The landing page for PoultryPal, showcasing:
 *  - Navbar
 *  - Hero section with primary call-to-action
 *  - Features grid
 *  - Testimonials
 *  - Final CTA
 *  - Footer
 */
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 md:px-16 py-12 mb-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                  Welcome to <span className="text-green-700">PoultryPal</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                  Manage your poultry farm's daily records efficiently and effortlessly. Our application harnesses the power of AI and machine learning to provide predictive insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button size="lg" className="bg-green-700 hover:bg-green-800">
                    <a href="/signup">Get Started</a>
                  </Button>
                  <Button variant="outline" size="lg">
                    <a href="/login" className="flex items-center">
                      Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="relative">
                {/* Hero Image & Badge */}
                <img
                  src="/farm.jpg" 
                  alt="Poultry farm management"
                  className="rounded-lg shadow-xl object-cover w-full h-auto"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                  <p className="font-semibold text-green-700">Trusted by farms across Uganda</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Smart Poultry Management Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Disease Diagnosis",
                  description: "AI-powered disease detection through image analysis of poultry droppings.",
                  icon: "🔬"
                },
                {
                  title: "Environmental Monitoring",
                  description: "Real-time tracking of temperature, humidity, and ammonia levels.",
                  icon: "🌡️"
                },
                {
                  title: "Production Tracking",
                  description: "Easily log and analyze egg production and mortality rates.",
                  icon: "📊"
                },
                {
                  title: "Stock Management",
                  description: "Keep track of feed, medication, and equipment with automatic alerts.",
                  icon: "📦"
                },
                {
                  title: "Task Scheduling",
                  description: "Plan and manage immunization and disease control activities.",
                  icon: "📅"
                },
                {
                  title: "Data-Driven Insights",
                  description: "Gain valuable insights to optimize your farm's productivity.",
                  icon: "📈"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Farmers Say</h2>
             {/* Single Testimonial Card */}
            <div className="bg-green-700 text-white p-8 rounded-lg">
              <p className="text-xl italic mb-6">"PoultryPal has transformed how we manage our farm. The disease diagnosis feature helped us identify issues early, saving thousands of birds."</p>
              <div className="flex items-center">
                 {/* Initials Avatar */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-700 font-bold">JK</div>
                <div className="ml-4">
                  <p className="font-semibold">Johnson Kalibbala</p>
                  <p className="text-green-200">Sunny Farms, Kampala</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-900 text-white py-16 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to optimize your poultry farm?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-300">Join hundreds of farms already using PoultryPal to increase productivity and improve bird health.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-700 hover:bg-green-600">
                <a href="/signup">Create Free Account</a>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                <a href="/login">Login</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;