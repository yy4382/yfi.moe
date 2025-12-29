import { Routes, Route, Navigate } from "react-router";
import { AppLayout } from "./components/layout/app-layout";
import { useAuth } from "./hooks/use-auth";
import { LoginPage } from "./pages/login";
import { PostCreatePage } from "./pages/post-create";
import { PostEditPage } from "./pages/post-edit";
import { PostsListPage } from "./pages/posts-list";
import { SettingsPage } from "./pages/settings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PostsListPage />} />
        <Route path="posts" element={<PostsListPage />} />
        <Route path="posts/new" element={<PostCreatePage />} />
        <Route path="posts/:slug" element={<PostEditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
