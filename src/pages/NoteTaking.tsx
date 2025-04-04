
import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, Youtube, DownloadCloud, Copy, Pencil, Check, X } from 'lucide-react';

const NoteTaking = () => {
  const [inputType, setInputType] = useState<'pdf' | 'youtube'>('pdf');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) {
      toast.error('Please enter a valid input');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call for note generation
      setTimeout(() => {
        let notes;
        if (inputType === 'pdf') {
          notes = `# Study Notes: Advanced Physics Concepts

## Chapter 1: Quantum Mechanics Fundamentals

### Key Concepts:
- **Wave-Particle Duality**: Light and matter exhibit properties of both waves and particles
- **Heisenberg Uncertainty Principle**: Cannot simultaneously know position and momentum with precision
- **Schrödinger Equation**: Describes how quantum state changes over time

### Important Formulas:
- E = hf (Energy of a photon)
- ΔxΔp ≥ ħ/2 (Uncertainty principle)
- λ = h/p (de Broglie wavelength)

## Chapter 2: Quantum States

### Wave Functions:
- Represent probability amplitudes
- Must be normalized
- Collapse upon measurement

### Applications:
1. Quantum computing
2. Quantum cryptography
3. Quantum sensors

---

*These notes were generated based on your PDF upload. To continue learning, try creating flashcards or asking specific questions about these concepts.*`;
        } else {
          notes = `# Video Notes: Introduction to Machine Learning

## 1. What is Machine Learning?
- **Definition**: Field of study that gives computers the ability to learn without being explicitly programmed
- **Types**:
  - Supervised Learning
  - Unsupervised Learning
  - Reinforcement Learning

## 2. Supervised Learning
- Uses labeled data
- **Examples**:
  - Classification (email spam detection)
  - Regression (house price prediction)
- **Popular Algorithms**:
  - Linear Regression
  - Decision Trees
  - Neural Networks

## 3. Unsupervised Learning
- Works with unlabeled data
- Finds patterns and structure
- **Applications**:
  - Clustering
  - Dimensionality reduction
  - Anomaly detection

## 4. Key Concepts
- **Training vs Testing**: Split data to evaluate model performance
- **Overfitting**: Model learns noise in training data
- **Feature Engineering**: Creating meaningful inputs for models

---

*Notes generated from YouTube video. Use the Doubt Assistant to ask questions about these topics!*`;
        }
        
        setGeneratedNotes(notes);
        setEditableNotes(notes);
        setIsLoading(false);
        toast.success('Notes generated successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to generate notes');
      setIsLoading(false);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(generatedNotes);
    toast.success('Notes copied to clipboard!');
  };

  const handleDownloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedNotes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'study_notes.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Notes downloaded!');
  };

  const handleEditMode = () => {
    if (isEditing) {
      setGeneratedNotes(editableNotes);
      toast.success('Notes updated!');
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setEditableNotes(generatedNotes);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Notes Generator</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Notes</CardTitle>
              <CardDescription>
                Upload a PDF or enter a YouTube URL to generate structured notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="pdf" className="w-full" onValueChange={(value) => setInputType(value as 'pdf' | 'youtube')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pdf" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pdf" className="space-y-4 pt-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your PDF file, or click to browse
                      </p>
                      <Input 
                        type="file" 
                        className="hidden" 
                        id="pdfUpload" 
                        accept=".pdf"
                        onChange={(e) => setInputValue(e.target.files?.[0]?.name || '')}
                      />
                      <Label htmlFor="pdfUpload" className="cursor-pointer">
                        <Button type="button" variant="outline">
                          Select PDF File
                        </Button>
                      </Label>
                      {inputValue && (
                        <p className="mt-2 text-sm">Selected: {inputValue}</p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="youtube" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl">YouTube URL</Label>
                      <Input 
                        id="youtubeUrl" 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a valid YouTube video URL to generate notes
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label>Note Style</Label>
                  <RadioGroup defaultValue="comprehensive" className="flex space-x-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comprehensive" id="comprehensive" />
                      <Label htmlFor="comprehensive">Comprehensive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="concise" id="concise" />
                      <Label htmlFor="concise">Concise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bullet" id="bullet" />
                      <Label htmlFor="bullet">Bullet Points</Label>
                    </div>
                  </RadioGroup>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                disabled={!inputValue || isLoading} 
                className="w-full bg-spark-600 hover:bg-spark-700"
              >
                {isLoading ? 'Generating...' : 'Generate Notes'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Generated Notes</CardTitle>
                <CardDescription>
                  Your structured study notes will appear here
                </CardDescription>
              </div>
              {generatedNotes && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleEditMode}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleEditMode}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {generatedNotes ? (
                isEditing ? (
                  <Textarea 
                    className="min-h-[400px] font-mono text-sm" 
                    value={editableNotes}
                    onChange={(e) => setEditableNotes(e.target.value)}
                  />
                ) : (
                  <div className="border rounded-md p-4 min-h-[400px] max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                    {generatedNotes}
                  </div>
                )
              ) : (
                <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>No notes generated yet</p>
                  <p className="text-sm">Upload a PDF or YouTube video to get started</p>
                </div>
              )}
            </CardContent>
            {generatedNotes && !isEditing && (
              <CardFooter className="flex justify-between gap-4">
                <Button variant="outline" className="w-1/2" onClick={handleCopyNotes}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button className="w-1/2 bg-spark-600 hover:bg-spark-700" onClick={handleDownloadNotes}>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NoteTaking;
