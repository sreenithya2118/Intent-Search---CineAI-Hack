import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import UploadVideoPage from './pages/UploadVideoPage'
import SearchPage from './pages/SearchPage'
import ProductionPlannerPage from './pages/ProductionPlannerPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadVideoPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="production-planner" element={<ProductionPlannerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
