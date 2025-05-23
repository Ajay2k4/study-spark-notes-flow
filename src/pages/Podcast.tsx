import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Headphones, 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Check,
  Clock
} from 'lucide-react';

const Podcast = () => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes as a default duration
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [playerExpanded, setPlayerExpanded] = useState(false);

  const handleGeneratePodcast = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call for audio generation
      setTimeout(() => {
        setAudioGenerated(true);
        setIsGenerating(false);
        toast.success('Audio podcast generated successfully!');
      }, 3000);
    } catch (error) {
      toast.error('Failed to generate podcast');
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast(isPlaying ? 'Paused' : 'Playing');
  };

  const handleDownload = () => {
    toast.success('Podcast downloaded!');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Audio Summarizer</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Audio Podcast</CardTitle>
              <CardDescription>
                Convert your notes into an audio podcast for on-the-go learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Study Material</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your notes or enter key points to convert to audio..."
                    className="min-h-[200px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice Style</Label>
                    <Select defaultValue="natural">
                      <SelectTrigger id="voice">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent">Accent</Label>
                    <Select defaultValue="american">
                      <SelectTrigger id="accent">
                        <SelectValue placeholder="Select accent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="british">British</SelectItem>
                        <SelectItem value="australian">Australian</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGeneratePodcast} 
                disabled={!content.trim() || isGenerating} 
                className="w-full bg-spark-600 hover:bg-spark-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Podcast'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio Player</CardTitle>
              <CardDescription>
                Listen to your generated podcast
              </CardDescription>
            </CardHeader>
            <CardContent>
              {audioGenerated ? (
                <div className="space-y-6">
                  <div 
                    className={`border rounded-lg p-6 ${playerExpanded ? 'h-[300px]' : 'h-[180px]'} flex flex-col justify-between bg-gradient-to-br from-spark-50 to-ocean-50 transition-all duration-300`}
                    onClick={() => setPlayerExpanded(!playerExpanded)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-spark-600 text-white p-2 rounded-full">
                            <Headphones className="h-4 w-4" />
                          </div>
                          <h3 className="font-medium">Your Study Podcast</h3>
                        </div>
                        {playerExpanded && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Generated from your notes about quantum mechanics and machine learning concepts
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-spark-600" 
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-4">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <SkipBack className="h-5 w-5" />
                        </button>
                        <button 
                          className="bg-spark-600 text-white p-2 rounded-full hover:bg-spark-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <SkipForward className="h-5 w-5" />
                        </button>
                      </div>

                      {playerExpanded && (
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            value={volume}
                            max={100}
                            step={1}
                            className="w-24"
                            onValueChange={setVolume}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Select 
                          value={playbackSpeed} 
                          onValueChange={setPlaybackSpeed}
                        >
                          <SelectTrigger 
                            className="h-8 w-[70px]" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue placeholder="Speed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5x</SelectItem>
                            <SelectItem value="0.75">0.75x</SelectItem>
                            <SelectItem value="1">1x</SelectItem>
                            <SelectItem value="1.25">1.25x</SelectItem>
                            <SelectItem value="1.5">1.5x</SelectItem>
                            <SelectItem value="2">2x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Generated successfully</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                      Download MP3
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center min-h-[280px] text-muted-foreground">
                  <Headphones className="h-12 w-12 mb-4 opacity-50" />
                  <p>No audio generated yet</p>
                  <p className="text-sm">Enter your content and click generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Podcast;
