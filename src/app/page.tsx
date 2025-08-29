import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, CreditCard, PiggyBank, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md py-4 fixed top-0 z-50 dark:bg-slate-900/80 dark:border-slate-700/50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-slate-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>BudgetFlow</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">
              Sign In
            </Link>
            <Link href="/login?signup=true">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 mb-8 tracking-tight dark:text-white">
              Take Control of Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Money
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed dark:text-slate-300">
              A simple, powerful budgeting app that helps you track expenses, set savings goals, and stay on top of your finances. 
              No complicated banking features—just straightforward money management.
            </p>
            <div className="flex justify-center items-center mb-16">
              <Link href="/login?signup=true">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Everything You Need to Budget Better
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-300">
              Simple features that make budgeting easy and actually enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Simple Analytics",
                description: "See where your money goes with easy-to-understand charts and spending insights.",
                color: "text-blue-600"
              },
              {
                icon: <CreditCard className="h-8 w-8" />,
                title: "Expense Tracking",
                description: "Track your spending by category and see your spending habits at a glance.",
                color: "text-green-600"
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Goal Setting",
                description: "Set savings goals and track your progress with simple visual indicators.",
                color: "text-purple-600"
              },
              {
                icon: <PiggyBank className="h-8 w-8" />,
                title: "Savings Tracking",
                description: "Keep track of your savings progress and celebrate when you reach your goals.",
                color: "text-orange-600"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Subscription Tracking",
                description: "Track your monthly subscriptions and recurring expenses in one place.",
                color: "text-indigo-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <div className={`${feature.color} mb-6`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-300">
              Simple setup that gets you budgeting right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-400/30">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Add Your Income</h3>
              <p className="text-slate-600 dark:text-slate-300">Start by adding your monthly income to set up your budget foundation</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto border border-indigo-400/30">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Set Your Goals</h3>
              <p className="text-slate-600 dark:text-slate-300">Set savings goals and spending limits that work for your lifestyle</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-400/30">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Track & Save</h3>
              <p className="text-slate-600 dark:text-slate-300">Track your spending, stay within your budget, and watch your savings grow</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Start Budgeting?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Join users who have already taken control of their money and started saving more.
          </p>
          <Link href="/login?signup=true">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-slate-400 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <span>© 2025 BudgetFlow. All rights reserved.</span>
            </div>
            <div className="text-slate-400 text-sm">
              Powered by ZForgeLabs LLC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
