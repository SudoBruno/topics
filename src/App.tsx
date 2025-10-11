import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { TopicEditor } from "@/components/TopicEditor/TopicEditor";
import { TopicTree } from "@/components/TopicTree/TopicTree";
import { Layout } from "@/components/Layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topic/:id" element={<TopicEditor />} />
          <Route path="/topic/new" element={<TopicEditor />} />
          <Route path="/tree" element={<TopicTree />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
