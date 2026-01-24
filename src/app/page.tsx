"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Camera,
      title: "Professional Platform",
      description: "Showcase your photography and event services to thousands of potential clients"
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join a network of verified vendors and event professionals"
    },
    {
      icon: TrendingUp,
      title: "Boost Your Business",
      description: "Get discovered by clients actively looking for your services"
    },
    {
      icon: Shield,
      title: "Verified & Trusted",
      description: "Build credibility with our verification badge and review system"
    }
  ];

  const benefits = [
    "Free vendor registration",
    "Custom business profile",
    "Direct client bookings",
    "Secure payment handling",
    "Real-time notifications",
    "Analytics dashboard"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="bg-gradient-primary text-white border-0 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            India&apos;s Fastest Growing Event Platform
          </Badge>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="text-slate-900">
              Event Business
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join SR Portraits & Events marketplace and connect with clients looking for 
            professional photography and event services.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="bg-gradient-primary text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => router.push("/vendor")}
            >
              Become a Vendor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-2"
            >
              Learn More
            </Button>
          </div>

          {/* Social Proof */}
          {/* <div className="flex items-center justify-center gap-6 pt-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-primary border-2 border-white"
                  />
                ))}
              </div>
              <span className="font-medium">500+ Active Vendors</span>
            </div>
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="border-0 shadow-2xl bg-accent overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Image/Gradient */}
              <div className="bg-gradient-primary p-12 flex flex-col justify-center items-start text-white min-h-[400px]">
                <Badge className="bg-white/20 text-white border-0 mb-6">
                  Vendor Benefits
                </Badge>
                <h2 className="text-4xl font-bold mb-4">
                  Everything you need to succeed
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  We provide all the tools and support to help you grow your event business 
                  and reach more clients.
                </p>
                <div className="mt-8 flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Verified & Secure Platform</span>
                </div>
              </div>

              {/* Right Side - Benefits List */}
              <div className="p-12 bg-white flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">
                  What You Get
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="mt-8 bg-gradient-primary text-white w-full"
                  onClick={() => router.push("/vendor")}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: "500+", label: "Active Vendors" },
            { value: "10K+", label: "Happy Clients" },
            { value: "50K+", label: "Events Completed" }
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-slate-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16 pb-24">
        <Card className="border-0 shadow-2xl bg-gradient-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          <CardContent className="p-12 md:p-16 text-center relative z-10">
            <Sparkles className="h-12 w-12 mx-auto mb-6 text-white" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to grow your business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of vendors already succeeding on our platform. 
              Start receiving bookings today.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="px-10 py-6 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => router.push("/vendor")}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 text-sm">
            © {new Date().getFullYear()} SR Portraits & Events. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}