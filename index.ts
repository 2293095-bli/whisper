export type Entry = {
  id: string;
  message: string;
  created_at: string;
};

export type AdminEntry = Entry & {
  is_hidden: boolean;
};
