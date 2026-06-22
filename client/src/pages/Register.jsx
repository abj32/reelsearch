import AuthForm from "../components/AuthForm";

export default function Register({ onAuth }) {
  return <AuthForm mode="register" onAuth={onAuth} />;
}