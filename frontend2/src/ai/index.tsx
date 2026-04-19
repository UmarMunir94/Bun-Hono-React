import { Routes, Route, Navigate } from '@tanstack/react-router';
import { DefaultLayout } from './layout';
import { AIChatPage } from './pages/chat';
import { AIStartPage } from './pages/start';

export default function AIModule() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Navigate to="start" replace />} />
        <Route path="start" element={<AIStartPage />} />
        <Route path="chat" element={<AIChatPage />} />
      </Route>
    </Routes>
  );
}

