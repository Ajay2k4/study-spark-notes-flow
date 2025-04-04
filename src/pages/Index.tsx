
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Laptop, Brain, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-spark-600 text-white p-2 rounded-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">StudySpark</h1>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-spark-600 hover:bg-spark-700">Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 bg-gradient-to-br from-spark-50 to-ocean-50">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Supercharge Your Learning with AI Study Assistance
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Transform how you learn with our AI-powered study suite featuring note generation, 
            doubt clarification, flashcards, and audio summaries.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button className="w-full sm:w-auto bg-spark-600 hover:bg-spark-700 text-white px-8 py-6">
                Get Started for Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-6">
                Login
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white p-8 md:p-16 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <div className="agent-card">
              <BookOpen className="h-12 w-12 text-spark-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Notes Generator</h3>
              <p className="text-sm text-muted-foreground">
                Turn PDFs and videos into well-structured study notes
              </p>
            </div>
            <div className="agent-card">
              <Laptop className="h-12 w-12 text-ocean-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Doubt Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get instant answers to questions about your study materials
              </p>
            </div>
            <div className="agent-card">
              <Brain className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Flashcards</h3>
              <p className="text-sm text-muted-foreground">
                Create visual flashcards to reinforce key concepts
              </p>
            </div>
            <div className="agent-card">
              <Sparkles className="h-12 w-12 text-amber-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Audio Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Listen to your notes as podcasts for on-the-go learning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-8 text-center text-sm text-muted-foreground">
        <p>© 2025 StudySpark. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
