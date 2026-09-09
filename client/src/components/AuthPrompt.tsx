import { AuthView, type AuthViewPath } from "@neondatabase/auth-ui";
import "./AuthPrompt.css";

interface AuthPromptProps {
  view: AuthViewPath;
  onSkip: () => void;
}

export function AuthPrompt({ view, onSkip }: AuthPromptProps) {
  return (
    <div className="auth-overlay">
      <div className="auth-prompt">
        <AuthView view={view} className="auth-card" />
        <button className="auth-skip" onClick={onSkip}>
          Continue as guest
        </button>
      </div>
    </div>
  );
}
