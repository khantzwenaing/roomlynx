
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx executing - Starting application");

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  console.log("Found root element, rendering App");
  root.render(<App />);
} else {
  console.error("Failed to find root element in DOM");
}
