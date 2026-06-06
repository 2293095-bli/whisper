export type AdminEntry = {
  id: string;
  message: string;
  created_at: string;
  ip_hash?: string | null;
  user_agent?: string | null;
  is_hidden?: boolean;
};
