import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Shield,
  Clock,
  Users,
  Star,
  ArrowRight,
  Stethoscope,
  Calendar,
  FileText,
  Video,
} from "lucide-react";

const Welcome1 = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with verified doctors in just a few clicks",
    },
    {
      icon: <Video className="w-8 h-8 text-green-600" />,
      title: "Telemedicine Support",
      description: "Consult with doctors via video calls from the comfort of your home",
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "Digital Health Records",
      description: "Securely store and access your medical history anytime",
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "HIPAA Compliant",
      description: "Your health data is protected with industry-standard security",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "500+", label: "Verified Doctors" },
    { number: "50+", label: "Specializations" },
    { number: "24/7", label: "Emergency Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-transparent backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Hello Dr
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4 mr-2" />
                Trusted Healthcare Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Health,
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {" "}
                  Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with certified healthcare professionals, book appointments
                instantly, and manage your health records securely - all in one
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/role-selection")}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
                >
                  Book Appointment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/role-selection")}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                >
                  Join as Doctor
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&crop=face"
                  alt="Doctor consultation"
                  className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">4.9/5 Rating</p>
                    <p className="text-sm text-gray-600">
                      From 10,000+ patients
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Hello Dr?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare like never before with our comprehensive digital
              platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients and doctors who trust Hello Dr for their
            healthcare needs
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/role-selection")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/role-selection")}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Hello Dr</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting patients with healthcare professionals for better health
                outcomes.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/help-center")}
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy-policy")}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/coming-soon")}
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/coming-soon")}
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

         
        </div>
      </footer>
    </div>
  );
};

export default Welcome1;
