import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { WebSocketProvider } from "@/context/WebSocketContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketProvider>
          <Component {...pageProps} />
        </WebSocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
