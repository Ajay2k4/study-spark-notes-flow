
import api from './api';
import { toast } from 'sonner';

interface Podcast {
  _id: string;
  title: string;
  content: string;
  audio_url: string;
  duration: number;
  voice_id: string;
  tags: string[];
  created_at: string;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  preview_url?: string;
}

interface CreatePodcastData {
  title: string;
  content: string;
  voice_id?: string;
  tags?: string[];
}

export const podcastService = {
  // Get all podcasts
  getAllPodcasts: async (): Promise<Podcast[]> => {
    try {
      const response = await api.get('/podcasts');
      return response.data;
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast.error('Failed to fetch podcasts');
      throw error;
    }
  },

  // Get a specific podcast
  getPodcast: async (id: string): Promise<Podcast> => {
    try {
      const response = await api.get(`/podcasts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching podcast:', error);
      toast.error('Failed to fetch podcast');
      throw error;
    }
  },

  // Create a new podcast
  createPodcast: async (data: CreatePodcastData): Promise<Podcast> => {
    try {
      const response = await api.post('/podcasts', {
        title: data.title,
        content: data.content,
        voice_id: data.voice_id || 'default',
        tags: data.tags || []
      });
      toast.success('Podcast created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating podcast:', error);
      toast.error('Failed to create podcast');
      throw error;
    }
  },

  // Delete a podcast
  deletePodcast: async (id: string): Promise<void> => {
    try {
      await api.delete(`/podcasts/${id}`);
      toast.success('Podcast deleted successfully');
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast.error('Failed to delete podcast');
      throw error;
    }
  },

  // Get available voices
  getVoices: async (): Promise<Voice[]> => {
    try {
      const response = await api.get('/podcasts/voices');
      return response.data;
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast.error('Failed to fetch voices');
      return [
        { id: 'default', name: 'Default Voice', gender: 'neutral' }
      ];
    }
  }
};
