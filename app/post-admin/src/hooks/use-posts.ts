import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPosts,
  fetchPost,
  updatePost,
  createPost,
  deletePost,
} from "../api/posts";
import type { PostFrontmatter } from "../types/post";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      frontmatter,
      content,
    }: {
      slug: string;
      frontmatter: PostFrontmatter;
      content: string;
    }) => updatePost(slug, frontmatter, content),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts", slug] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      frontmatter,
      content,
    }: {
      frontmatter: PostFrontmatter;
      content: string;
    }) => createPost(frontmatter, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
