// app/[base_id]/layout.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ base_id: string }>();
  const baseId = params.base_id;
  const router = useRouter();

  const { data: base, isLoading } = api.base.getById.useQuery(
    { id: baseId },
    { enabled: !!baseId },
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="flex h-full w-15 shrink-0 flex-col border-r border-gray-200 bg-white pt-2">
        <div className="flex-1">
          <div className="p-2">
            <button
              className="flex w-full justify-center text-gray-700 hover:bg-gray-100"
              onClick={() => router.replace("/")}
            >
              <Image
                src="/airtable-logo-bw.svg"
                alt="Google"
                width={25}
                height={25}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0">

        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 pt-2 text-sm">
          <div className="flex items-center">
            <div className="mr-2 rounded bg-blue-900 p-1">
              <Image
                src="/airtable-logo-white.png"
                alt="Google"
                width={20}
                height={20}
              />
            </div>
            <h1 className="mr-1 text-lg font-bold text-gray-800">
              {base?.name}
            </h1>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
