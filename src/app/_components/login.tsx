"use client";

import Link from "next/link";
import Head from "next/head";
import Image from "next/image"
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [loginEnabled, setLoginEnabled] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setLoginEnabled(emailRegex.test(email));
  }, [email]);

  return (
    <>
      <Head>
        <title>Sign in to Airtable Clone</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex">
            <Image
              src="../airtable-logo-colour.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-semibold text-gray-900">
            Sign in to Airtable
          </h1>

          {/* Email Input */}
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                className="w-full rounded border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <button
              type="submit"
              className={`w-full rounded py-2 text-sm font-medium ${loginEnabled ? "cursor-none bg-blue-500" : "cursor-pointer bg-blue-200"} text-white transition`}
            >
              Continue
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-between">
            <hr className="w-full border-gray-300" />
            <span className="px-2 text-sm text-gray-500">or</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button className="w-full rounded border border-gray-300 py-2 text-sm transition hover:bg-gray-100">
              Sign in with <span className="font-medium">Single Sign On</span>
            </button>

            <Link
              href="/api/auth/signin"
              className="flex w-full items-center justify-center rounded border border-gray-300 py-2 text-sm transition hover:bg-gray-100"
            >
              <Image
                src="/google-logo.svg"
                alt="Google"
                width={16}
                height={16}
                className="mr-2"
              />
              Continue with <span className="ml-1 font-medium">Google</span>
            </Link>

            <button className="flex w-full items-center justify-center rounded border border-gray-300 py-2 text-sm transition hover:bg-gray-100">
              <Image
                src="/apple-logo.svg"
                alt="Apple"
                width={16}
                height={16}
                className="mr-2"
              />
              Continue with <span className="ml-1 font-medium">Apple ID</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600">
            New to Airtable?{" "}
            <a href="#" className="text-blue-600 underline hover:no-underline">
              Create an account
            </a>{" "}
            instead
          </p>
        </div>
      </div>
    </>
  );
}
