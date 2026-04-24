import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav       from './components/Nav';
import Home      from './pages/Home';
import Converter from './pages/Converter';
import CropTool  from './pages/CropTool';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-glow" />
      <div className="app-shell">
        <Nav />
        <div className="app-content">
          <Routes>
            <Route path="/"          element={<Home />}      />
            <Route path="/converter" element={<Converter />} />
            <Route path="/crop"      element={<CropTool />}  />
          </Routes>
        </div>
        <footer className="app-footer">
          <p>Done By: Cleo Thomas</p>
          <p>This is a property of Hype NA</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
