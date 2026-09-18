export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          role: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          role?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          employee_id: string;
          title: string;
          description: string | null;
          priority: 'Low' | 'Medium' | 'High';
          duration_hours: number;
          start_hour: number;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_id: string;
          title: string;
          description?: string | null;
          priority: 'Low' | 'Medium' | 'High';
          duration_hours: number;
          start_hour: number;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          employee_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'Low' | 'Medium' | 'High';
          duration_hours?: number;
          start_hour?: number;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Employee = Database['public']['Tables']['employees']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];