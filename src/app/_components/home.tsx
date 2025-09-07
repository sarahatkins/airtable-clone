"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import BaseWidget from "./Dashboard/BaseWidget";
import Image from "next/image";
import Sidebar from "./Dashboard/Sidebar";
import {
  AlignJustify,
  ArrowUp,
  ChevronDown,
  Grid2X2,
  Search,
  Sparkles,
  TableCellsSplit,
} from "lucide-react";
import HomeWidget from "./Dashboard/HomeWidget";
import { useSession } from "next-auth/react";
import type { InferSelectModel } from "drizzle-orm";
import type { BaseType } from "../defaults";

// app/page.tsx
export default function Dashboard() {
  const [expandedSidebar, setExpandedSidebar] = useState<boolean>(true);

  const { data: session } = useSession();
  const { data: bases } = api.base.getAll.useQuery(
    { userId: session?.user.id ?? "" }, // pass empty string if session not ready
    { enabled: !!session }, // only run query when session exists
  );

  const [baseList, setBaseList] = useState<BaseType[]>([]);

  useEffect(() => {
    if (bases) {
      setBaseList(bases);
    }
  }, [bases]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header
        style={{ height: "8vh" }}
        className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4 shadow-sm"
      >
        <div className="flex items-center">
          <AlignJustify
            className="mr-5 h-5 w-5"
            onClick={() => setExpandedSidebar((prev) => !prev)}
          />
          <Image
            src="/airtable-logo-name.png"
            alt="Google"
            width={100}
            height={100}
            className="mr-2"
          />
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-full rounded-3xl border border-gray-300 py-2 pr-4 pl-10 focus:ring focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button>❓</button>
          <button>🔔</button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
            S
          </div>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex h-full flex-1">
        {/* Sidebar */}
        <div style={{ height: "92vh" }}>
          <Sidebar expanded={expandedSidebar} />
        </div>

        {/* Main content */}
        <div className="flex h-full flex-1 flex-col overflow-auto p-10 pb-10">
          <div className="flex-1 space-y-5">
            {/* Build app card */}
            <h1 className="text-2xl font-bold">Home</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <HomeWidget
                name={"Start with Omni"}
                desc={"Use AI to build a custom app tailored to your workflow."}
                icon={Sparkles}
                color="pink-600"
              />
              <HomeWidget
                name={"Start with templates"}
                desc={
                  "Select a template to get started and customize as you go."
                }
                icon={Grid2X2}
                color="purple-950"
              />
              <HomeWidget
                name={"Quickly upload"}
                desc={
                  "Easily migrate your existing projects in just a few minutes."
                }
                icon={ArrowUp}
                color="emerald-700"
              />
              <HomeWidget
                name={"Build an app on your own"}
                desc={"Start with a blank app and build your ideal workflow."}
                icon={TableCellsSplit}
                color="blue-800"
              />
            </div>

            {/* Opened section */}
            <div>
              <div className="flex justify-between">
                <h3 className="mb-3 flex items-center text-sm text-gray-700">
                  Opened anytime{" "}
                  <ChevronDown width={15} height={15} className="ml-1" />
                </h3>
                <div className="flex">
                  <AlignJustify
                    width={17}
                    height={17}
                    className="ml-1 text-gray-700"
                  />
                  <Grid2X2
                    width={17}
                    height={17}
                    className="ml-2 text-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
                {baseList.map((b) => (
                  <BaseWidget key={b.id} base={b} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
