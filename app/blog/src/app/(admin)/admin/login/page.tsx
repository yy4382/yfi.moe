import { Metadata } from "next";
import { LoginForm } from "@/app/(admin)/admin/login/login-form";
import logo from "@/assets/logo.svg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex items-center justify-center rounded-md p-1">
            <Image
              src={logo}
              alt="logo"
              width={24}
              height={24}
              className="size-5"
            />
          </div>
          Yunfi Panel
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
