
import api from './api';
import { toast } from 'sonner';

interface Note {
  _id: string;
  title: string;
  content: string;
  source_type: string;
  source_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface CreateNoteData {
  title: string;
  content: string;
  source_type: string;
  source_url?: string;
  tags: string[];
}

interface CreateNoteFromPDF {
  title?: string;
  tags: string[];
}

interface CreateNoteFromYoutube {
  youtube_url: string;
  title?: string;
  tags: string[];
}

export const notesService = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const response = await api.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
      throw error;
    }
  },

  // Get a specific note
  getNote: async (id: string): Promise<Note> => {
    try {
      const response = await api.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      toast.error('Failed to fetch note');
      throw error;
    }
  },

  // Create a new note manually
  createNote: async (data: CreateNoteData): Promise<Note> => {
    try {
      const response = await api.post('/notes', data);
      toast.success('Note created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      throw error;
    }
  },

  // Generate notes from PDF
  createNoteFromPDF: async (file: File, data: CreateNoteFromPDF): Promise<Note> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (data.title) formData.append('title', data.title);
      formData.append('tags', data.tags.join(','));

      const response = await api.post('/notes/from-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Notes generated from PDF successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating note from PDF:', error);
      toast.error('Failed to generate notes from PDF');
      throw error;
    }
  },

  // Generate notes from YouTube
  createNoteFromYoutube: async (data: CreateNoteFromYoutube): Promise<Note> => {
    try {
      const response = await api.post('/notes/from-youtube', data);
      toast.success('Notes generated from YouTube successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating note from YouTube:', error);
      toast.error('Failed to generate notes from YouTube');
      throw error;
    }
  },

  // Update a note
  updateNote: async (id: string, data: Partial<CreateNoteData>): Promise<Note> => {
    try {
      const response = await api.put(`/notes/${id}`, data);
      toast.success('Note updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (id: string): Promise<void> => {
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      throw error;
    }
  },
};
