import { ToastProvider } from "@/ui/ToastProvider";
import DemoPage from "@/demo/DemoPage";

function App() {
  return (
    <ToastProvider>
      <DemoPage />
    </ToastProvider>
  );
}

export default App;
