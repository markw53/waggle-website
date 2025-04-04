import Link from "next/link";

export default function ResetConfirmation() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          If the email exists in our system, a password reset link has been sent.
          Please check your inbox and follow the instructions.
        </p>

        <Link href="/login">
          <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
            Back to Login
          </button>
        </Link>
      </div>

      <footer className="mt-8 w-full text-center p-4 bg-[#E2B007] text-black">
        &copy; 2025 Waggle | Devon's Digital Solutions
      </footer>
    </div>
  );
}
