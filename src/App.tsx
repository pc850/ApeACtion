
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TokenProvider } from "@/context/TokenContext";
import { VideoProvider } from "@/context/VideoContext";

import NavBar from "@/components/NavBar";
import Index from "@/pages/Index";
import Earn from "@/pages/Earn";
import Feed from "@/pages/Feed";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TokenProvider>
      <VideoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <NavBar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/earn" element={<Earn />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </VideoProvider>
    </TokenProvider>
  </QueryClientProvider>
);

export default App;
