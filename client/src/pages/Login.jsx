import AuthForm from "../components/AuthForm";

export default function Login({ onAuth }) {
  return <AuthForm mode="login" onAuth={onAuth} />;
}