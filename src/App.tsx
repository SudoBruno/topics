import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { TopicEditor } from "@/components/TopicEditor/TopicEditor";
import { TopicTree } from "@/components/TopicTree/TopicTree";
import { Layout } from "@/components/Layout/Layout";
import { AuthPage } from "@/pages/AuthPage";
import { SharedTopicPage } from "@/pages/SharedTopicPage";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/shared/:token" element={<SharedTopicPage />} />
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
