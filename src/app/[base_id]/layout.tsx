// app/[base_id]/layout.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import OpenBaseModalButton from "../_components/Table/buttons/OpenBaseModalButton";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ base_id: string }>();
  const baseId = params.base_id;
  const router = useRouter();

  const { data: base } = api.base.getById.useQuery(
    { id: baseId },
    { enabled: !!baseId },
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="flex h-full w-13 shrink-0 flex-col border-r border-gray-200 bg-white pt-1.5">
        <div className="flex-1">
          <div className="p-2">
            <button
              className="flex w-full justify-center text-gray-700 hover:bg-gray-100"
              onClick={() => router.replace("/")}
            >
              <Image
                src="/airtable-logo-bw.svg"
                alt="Back"
                width={22}
                height={25}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-13 items-center justify-between border-b border-gray-200 bg-white px-4 text-sm">
          <div className="flex items-center">
            <div className="mr-2 rounded-md bg-blue-900 p-1.25">
              <Image
                src="/airtable-logo-white.png"
                alt="Airtable"
                width={22}
                height={20}
              />
            </div>
            {base && <OpenBaseModalButton base={base} />}
            <ChevronDown className="h-4 w-3.5 mt-1" />
          </div>

          {/* Middle nav */}
            <div className="ml-10 flex items-center gap-6 h-full">
              <button className="border-b-2 border-blue-800 h-full text-black">
                Data
              </button>
              <button className="text-gray-600 hover:text-gray-900 h-full border-b border-white">
                Automations
              </button>
              <button className="text-gray-600 hover:text-gray-900 h-full border-b border-white">
                Interfaces
              </button>
              <button className="text-gray-600 hover:text-gray-900 h-full border-b border-white">
                Forms
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <button className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50">
                Launch
              </button>
              <button className="rounded bg-sky-800 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                Share
              </button>
            </div>
          </div>
     


        <div className="min-h-0 flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
