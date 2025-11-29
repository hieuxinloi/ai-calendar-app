// Database types cho Supabase
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          time: string | null
          priority: 'high' | 'medium' | 'low'
          category: string | null
          completed: boolean
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          time?: string | null
          priority?: 'high' | 'medium' | 'low'
          category?: string | null
          completed?: boolean
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          time?: string | null
          priority?: 'high' | 'medium' | 'low'
          category?: string | null
          completed?: boolean
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      moods: {
        Row: {
          id: string
          user_id: string
          date: string
          mood: string
          note: string
          emoji: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood: string
          note?: string
          emoji: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood?: string
          note?: string
          emoji?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

