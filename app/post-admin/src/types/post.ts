export interface PostFrontmatter {
  title: string;
  slug: string;
  description?: string;
  date: string;
  publishedDate?: string;
  updated?: string;
  tags: string[];
  series?: { id: string; order?: number };
  highlight?: boolean;
  published: boolean;
  image?: string;
  copyright?: boolean;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
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
