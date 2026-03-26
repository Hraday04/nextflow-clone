import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="p-8 pb-12">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-white text-black hover:bg-neutral-200",
            },
          }}
        />
      </div>
    </div>
  );
}
