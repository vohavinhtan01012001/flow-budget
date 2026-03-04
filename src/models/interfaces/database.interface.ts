export interface IDatabase {
  public: {
    Enums: {
      budget_period: 'daily' | 'monthly' | 'weekly';
    };
    Tables: {
      budgets: {
        Insert: {
          amount: number;
          category_id?: null | string;
          id?: string;
          period: IDatabase['public']['Enums']['budget_period'];
          user_id: string;
        };
        Row: {
          amount: number;
          category_id: null | string;
          created_at: string;
          id: string;
          period: IDatabase['public']['Enums']['budget_period'];
          updated_at: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: null | string;
          period?: IDatabase['public']['Enums']['budget_period'];
        };
      };
      categories: {
        Insert: {
          color?: null | string;
          icon?: null | string;
          id?: string;
          is_preset?: boolean;
          name: string;
          sort_order?: number;
          user_id?: null | string;
        };
        Row: {
          color: null | string;
          icon: null | string;
          id: string;
          is_preset: boolean;
          name: string;
          sort_order: number;
          user_id: null | string;
        };
        Update: {
          color?: null | string;
          icon?: null | string;
          name?: string;
          sort_order?: number;
        };
      };
      expenses: {
        Insert: {
          amount: number;
          category_id?: null | string;
          description?: null | string;
          expense_date?: string;
          id?: string;
          note?: null | string;
          user_id: string;
        };
        Row: {
          amount: number;
          category_id: null | string;
          created_at: string;
          description: null | string;
          expense_date: string;
          id: string;
          note: null | string;
          updated_at: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: null | string;
          description?: null | string;
          expense_date?: string;
          note?: null | string;
        };
      };
      keyword_mappings: {
        Insert: {
          category_id: string;
          id?: string;
          keyword: string;
          user_id: string;
        };
        Row: {
          category_id: string;
          id: string;
          keyword: string;
          user_id: string;
        };
        Update: {
          category_id?: string;
          keyword?: string;
        };
      };
    };
  };
}

export type TJson =
  | boolean
  | null
  | number
  | string
  | TJson[]
  | { [key: string]: TJson | undefined };
