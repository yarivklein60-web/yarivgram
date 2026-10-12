import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/shared/Toast';
import Home from '@/pages/Home';
import Nutrition from '@/pages/Nutrition';
import Workouts from '@/pages/Workouts';
import Profile from '@/pages/Profile';
import Recipes from '@/pages/Recipes';
import PageNotFound from '@/pages/PageNotFound';

export default function App() {
  return (
    <Toaster>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Toaster>
  );
}
