
import { AxiosResponse } from 'axios';
import api from './api';

export interface PodcastVoice {
  id: string;
  name: string;
  gender: string;
  preview_url: string | null;
}

export interface PodcastCreate {
  title: string;
  content: string;
  voice_id?: string;
  tags?: string[];
}

export interface Podcast {
  _id: string;
  user_id: string;
  title: string;
  content: string;
  audio_url: string;
  duration: number;
  voice_id: string;
  tags: string[];
  created_at: string;
}

export const podcastService = {
  /**
   * Create a new podcast from text content
   */
  createPodcast: async (data: PodcastCreate): Promise<Podcast> => {
    try {
      const response: AxiosResponse<Podcast> = await api.post('/podcasts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating podcast:', error);
      throw error;
    }
  },

  /**
   * Get all podcasts for the current user
   */
  getPodcasts: async (): Promise<Podcast[]> => {
    try {
      const response: AxiosResponse<Podcast[]> = await api.get('/podcasts');
      return response.data;
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      throw error;
    }
  },

  /**
   * Get a specific podcast by ID
   */
  getPodcast: async (id: string): Promise<Podcast> => {
    try {
      const response: AxiosResponse<Podcast> = await api.get(`/podcasts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching podcast with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a podcast by ID
   */
  deletePodcast: async (id: string): Promise<void> => {
    try {
      await api.delete(`/podcasts/${id}`);
    } catch (error) {
      console.error(`Error deleting podcast with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get available TTS voices
   */
  getVoices: async (): Promise<PodcastVoice[]> => {
    try {
      const response: AxiosResponse<PodcastVoice[]> = await api.get('/podcasts/voices');
      return response.data;
    } catch (error) {
      console.error('Error fetching available voices:', error);
      throw error;
    }
  }
};
