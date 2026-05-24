import { AppErrorBoundary } from "./components/AppErrorBoundary/AppErrorBoundary";
import { WorkbenchPage } from "./pages/WorkbenchPage/WorkbenchPage";

export default function App() {
  return (
    <AppErrorBoundary>
      <WorkbenchPage />
    </AppErrorBoundary>
  );
}
