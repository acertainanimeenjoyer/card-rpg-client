// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu     from './pages/MainMenu';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage     from './pages/GamePage';
import EditorPage   from './pages/EditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing menu at "/" */}
        <Route path="/"        element={<MainMenu />} />

        {/* Auth */}
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Core app */}
        <Route path="/game"    element={<GamePage />} />
        <Route path="/editor"  element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
