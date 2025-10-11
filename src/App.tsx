import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { TopicEditor } from "@/components/TopicEditor/TopicEditor";
import { TopicTree } from "@/components/TopicTree/TopicTree";
import { Layout } from "@/components/Layout/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { useTopicsStore } from "@/store/topicsStore";

function App() {
  const initialize = useTopicsStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/topic/:id" element={<TopicEditor />} />
                  <Route path="/topic/new" element={<TopicEditor />} />
                  <Route path="/tree" element={<TopicTree />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
