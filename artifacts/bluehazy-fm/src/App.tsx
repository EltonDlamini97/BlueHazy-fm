import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "./components/Layout";

import Home from "./pages/Home";
import About from "./pages/About";
import Live from "./pages/Live";
import Shows from "./pages/Shows";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import Gallery from "./pages/Gallery";
import Advertise from "./pages/Advertise";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import { AdminGate } from "./components/AdminGate";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/live" component={Live} />
        <Route path="/shows" component={Shows} />
        <Route path="/news" component={News} />
        <Route path="/news/:id" component={NewsPost} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/advertise" component={Advertise} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin" component={() => <AdminGate><Admin /></AdminGate>} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
