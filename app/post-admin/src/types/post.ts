export interface Post {
  slug: string;
  raw: string;
  filename: string;
}

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  filename: string;
}

export interface GitStatus {
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
  modified: string[];
  created: string[];
  deleted: string[];
  staged: string[];
  isClean: boolean;
}
