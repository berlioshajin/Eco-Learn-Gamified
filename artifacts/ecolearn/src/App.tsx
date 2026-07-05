import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { StudentLayout, AdminLayout } from '@/components/layout';

// Pages
import Landing from '@/pages/landing';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Profile from '@/pages/profile';
import LearnHub from '@/pages/learn-hub';
import TopicLessons from '@/pages/topic-lessons';
import LessonDetail from '@/pages/lesson-detail';
import QuizBrowser from '@/pages/quiz-browser';
import TakeQuiz from '@/pages/take-quiz';
import Challenges from '@/pages/challenges';
import Leaderboard from '@/pages/leaderboard';
import Badges from '@/pages/badges';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard';
import AdminLessons from '@/pages/admin/lessons';
import AdminQuizzes from '@/pages/admin/quizzes';
import AdminChallenges from '@/pages/admin/challenges';
import AdminStudents from '@/pages/admin/students';

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Student Routes */}
      <Route path="/dashboard">
        <StudentLayout><Dashboard /></StudentLayout>
      </Route>
      <Route path="/profile">
        <StudentLayout><Profile /></StudentLayout>
      </Route>
      <Route path="/learn">
        <StudentLayout><LearnHub /></StudentLayout>
      </Route>
      <Route path="/learn/:topic">
        <StudentLayout><TopicLessons /></StudentLayout>
      </Route>
      <Route path="/learn/lesson/:id">
        <StudentLayout><LessonDetail /></StudentLayout>
      </Route>
      <Route path="/quiz">
        <StudentLayout><QuizBrowser /></StudentLayout>
      </Route>
      <Route path="/quiz/:id">
        <StudentLayout><TakeQuiz /></StudentLayout>
      </Route>
      <Route path="/challenges">
        <StudentLayout><Challenges /></StudentLayout>
      </Route>
      <Route path="/leaderboard">
        <StudentLayout><Leaderboard /></StudentLayout>
      </Route>
      <Route path="/badges">
        <StudentLayout><Badges /></StudentLayout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/lessons">
        <AdminLayout><AdminLessons /></AdminLayout>
      </Route>
      <Route path="/admin/quizzes">
        <AdminLayout><AdminQuizzes /></AdminLayout>
      </Route>
      <Route path="/admin/challenges">
        <AdminLayout><AdminChallenges /></AdminLayout>
      </Route>
      <Route path="/admin/students">
        <AdminLayout><AdminStudents /></AdminLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
