
import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Card as CardIcon, CircleCheck, X, ChevronLeft, ChevronRight, ImagePlus } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
}

const Flashcards = () => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleGenerateFlashcards = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call to generate flashcards
      setTimeout(() => {
        const generatedCards: Flashcard[] = [
          {
            id: '1',
            question: 'What is wave-particle duality?',
            answer: 'The concept that all particles exhibit both wave and particle properties, a fundamental principle in quantum mechanics.',
            imageUrl: 'https://via.placeholder.com/400x200/6d28d9/ffffff?text=Wave+Particle+Duality',
          },
          {
            id: '2',
            question: 'What is the Heisenberg Uncertainty Principle?',
            answer: 'A principle stating that we cannot simultaneously measure both the position and momentum of a particle with perfect precision.',
            imageUrl: 'https://via.placeholder.com/400x200/6d28d9/ffffff?text=Uncertainty+Principle',
          },
          {
            id: '3',
            question: 'What is the Schrödinger Equation?',
            answer: 'A partial differential equation that describes how the quantum state of a physical system changes over time.',
            imageUrl: 'https://via.placeholder.com/400x200/6d28d9/ffffff?text=Schrödinger+Equation',
          },
          {
            id: '4',
            question: 'What is the difference between supervised and unsupervised learning?',
            answer: 'Supervised learning uses labeled data for training while unsupervised learning works with unlabeled data to find patterns.',
            imageUrl: 'https://via.placeholder.com/400x200/6d28d9/ffffff?text=ML+Types',
          },
        ];

        setFlashcards(generatedCards);
        setIsGenerating(false);
        toast.success('Flashcards generated successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate flashcards');
      setIsGenerating(false);
    }
  };

  const handleStartReview = () => {
    if (flashcards.length === 0) {
      toast.error('No flashcards to review');
      return;
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsReviewing(true);
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      toast.success('Review completed!');
      setIsReviewing(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Flashcards Creator</h1>
          </div>
        </div>

        {isReviewing ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 flex justify-between items-center">
              <Button variant="outline" onClick={() => setIsReviewing(false)}>
                <X className="h-4 w-4 mr-2" />
                Exit Review
              </Button>
              <div className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {flashcards.length}
              </div>
            </div>

            <div 
              className="relative h-[400px] w-full cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`absolute w-full h-full preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute w-full h-full backface-hidden">
                  <Card className="w-full h-full flex flex-col">
                    <CardHeader className="border-b">
                      <CardTitle>Question</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                      <h3 className="text-xl font-semibold mb-4">
                        {flashcards[currentCardIndex]?.question}
                      </h3>
                      {flashcards[currentCardIndex]?.imageUrl && (
                        <img 
                          src={flashcards[currentCardIndex].imageUrl} 
                          alt="Flashcard visualization" 
                          className="max-w-full max-h-[200px] rounded-md"
                        />
                      )}
                    </CardContent>
                    <CardFooter className="border-t text-sm text-muted-foreground text-center">
                      Click to reveal answer
                    </CardFooter>
                  </Card>
                </div>

                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                  <Card className="w-full h-full flex flex-col">
                    <CardHeader className="border-b">
                      <CardTitle>Answer</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center p-6">
                      <p className="text-lg">{flashcards[currentCardIndex]?.answer}</p>
                    </CardContent>
                    <CardFooter className="border-t">
                      <div className="w-full flex justify-between">
                        <Button variant="outline" onClick={() => toast.success("Marked as needs review")}>
                          <X className="h-4 w-4 mr-2 text-destructive" />
                          Needs Review
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Marked as understood")}>
                          <CircleCheck className="h-4 w-4 mr-2" />
                          Got It
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleNextCard}
                className="bg-spark-600 hover:bg-spark-700"
              >
                {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Flashcards</CardTitle>
                <CardDescription>
                  Enter your notes or select content to generate visual flashcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Study Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Paste your notes or type content here..."
                      className="min-h-[200px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateFlashcards} 
                  disabled={!content.trim() || isGenerating} 
                  className="w-full bg-spark-600 hover:bg-spark-700"
                >
                  {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Flashcards</CardTitle>
                <CardDescription>
                  Review and practice with your generated flashcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flashcards.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {flashcards.slice(0, 4).map((card) => (
                        <div 
                          key={card.id} 
                          className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <CardIcon className="h-4 w-4 text-spark-600" />
                            <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm line-clamp-2">{card.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                    <CardIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p>No flashcards generated yet</p>
                    <p className="text-sm">Enter your notes and click generate</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleStartReview} 
                  disabled={flashcards.length === 0} 
                  className="w-full"
                >
                  Start Reviewing
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
