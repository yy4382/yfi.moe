import { createContext } from "react";
import type { CommentBoxId } from "../types";

/**
 * Context for passing comment box identification down the tree.
 * Used by InputBox to track mutation state.
 */
export const CommentBoxIdContext = createContext<CommentBoxId>({ path: "" });
