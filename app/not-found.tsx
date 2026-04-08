import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex bg-[#0d0d14] min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-8xl font-black text-[#f1f5f9] mb-2 opacity-10">404</h2>
      <h3 className="text-2xl font-bold text-[#f1f5f9] mb-3">Page Not Found</h3>
      <p className="text-[#94a3b8] mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
