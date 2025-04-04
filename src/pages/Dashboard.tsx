
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BookOpen, HelpCircle, Card as CardIcon, Headphones } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tools = [
    {
      id: 'notes',
      title: 'Notes Generator',
      description: 'Generate structured notes from PDFs or YouTube videos',
      icon: BookOpen,
      color: 'bg-spark-100 text-spark-600',
      path: '/notes',
    },
    {
      id: 'doubts',
      title: 'Doubt Assistant',
      description: 'Get answers to your questions about your study materials',
      icon: HelpCircle,
      color: 'bg-ocean-100 text-ocean-600',
      path: '/doubts',
    },
    {
      id: 'flashcards',
      title: 'Flashcards Creator',
      description: 'Convert key concepts into visual flashcards for better retention',
      icon: CardIcon,
      color: 'bg-green-100 text-green-600',
      path: '/flashcards',
    },
    {
      id: 'podcast',
      title: 'Audio Summarizer',
      description: 'Turn your notes into audio podcasts for on-the-go learning',
      icon: Headphones,
      color: 'bg-amber-100 text-amber-600',
      path: '/podcast',
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <SidebarTrigger />
            <h1 className="text-3xl font-bold mt-4">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Let's boost your study session today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className={`w-12 h-12 rounded-full ${tool.color} flex items-center justify-center mb-2`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(tool.path)}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="w-full bg-gradient-to-r from-spark-50 to-ocean-50">
            <CardHeader>
              <CardTitle>Getting Started with StudySpark</CardTitle>
              <CardDescription>
                Follow these steps to make the most of your AI study assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="bg-spark-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  1
                </div>
                <p>Start by uploading study material in the <strong>Notes Generator</strong> to create structured notes</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-spark-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  2
                </div>
                <p>Use the <strong>Doubt Assistant</strong> to ask questions about the content you're studying</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-spark-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  3
                </div>
                <p>Create <strong>Flashcards</strong> from your notes to reinforce key concepts with visual cues</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-spark-600 text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                  4
                </div>
                <p>Generate <strong>Audio Summaries</strong> to review material while on the go</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
