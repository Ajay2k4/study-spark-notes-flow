
import { useState, useRef, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  Clock,
  Save
} from 'lucide-react';
import { podcastService } from '@/services/podcastService';
import { useQuery } from '@tanstack/react-query';

const Podcast = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default duration (will be updated when audio loads)
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Fetch available voices
  const { data: voices, isLoading: loadingVoices } = useQuery({
    queryKey: ['voices'],
    queryFn: podcastService.getVoices,
  });

  // Audio element for playback
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up audio event listeners
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.onpause = () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };

    return () => {
      // Clean up
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Effect for playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play();
      
      // Update progress
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      progressTimerRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Effect for volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Effect for playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(playbackSpeed);
    }
  }, [playbackSpeed]);

  // Effect for audio URL
  useEffect(() => {
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.load();
    }
  }, [currentAudioUrl]);

  const handleGeneratePodcast = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content first');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for your podcast');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await podcastService.createPodcast({
        title,
        content,
        voice_id: selectedVoice,
        tags: []
      });
      
      if (response && response.audio_url) {
        setCurrentAudioUrl(response.audio_url);
        setAudioGenerated(true);
        toast.success('Audio podcast generated successfully!');
      }
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast.error('Failed to generate podcast. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSliderChange = (e: React.MouseEvent, value: number) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newTime = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownload = () => {
    if (currentAudioUrl) {
      // Create a hidden anchor element for downloading
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = currentAudioUrl;
      a.download = `${title || 'podcast'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Podcast downloaded!');
    }
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
                  <Label htmlFor="title">Podcast Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your podcast"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mb-4"
                  />

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
                    <Label htmlFor="voice">Voice</Label>
                    <Select 
                      value={selectedVoice}
                      onValueChange={setSelectedVoice}
                      disabled={loadingVoices}
                    >
                      <SelectTrigger id="voice">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingVoices ? (
                          <SelectItem value="loading">Loading voices...</SelectItem>
                        ) : (
                          voices?.map(voice => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.gender})
                            </SelectItem>
                          )) || [
                            <SelectItem key="default" value="default">Default</SelectItem>
                          ]
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="instructional">Instructional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGeneratePodcast} 
                disabled={!content.trim() || !title.trim() || isGenerating} 
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
              {audioGenerated && currentAudioUrl ? (
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
                          <h3 className="font-medium">{title || 'Your Study Podcast'}</h3>
                        </div>
                        {playerExpanded && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {content.length > 100 ? `${content.substring(0, 100)}...` : content}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div 
                        className="relative w-full h-2 bg-muted rounded-full overflow-hidden cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percent = (x / rect.width) * 100;
                          handleSliderChange(e, percent);
                        }}
                      >
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
                        <button 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={handleRewind}
                        >
                          <SkipBack className="h-5 w-5" />
                        </button>
                        <button 
                          className="bg-spark-600 text-white p-2 rounded-full hover:bg-spark-700 transition-colors"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>
                        <button 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={handleForward}
                        >
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="flex items-center gap-2 bg-spark-600 hover:bg-spark-700"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
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
