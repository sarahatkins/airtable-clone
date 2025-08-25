"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

// app/page.tsx
export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="px-6 py-4 flex items-center border-b">
          <h1 className="text-lg font-semibold text-red-600">Airtable</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100">
            <span className="mr-2">🏠</span> Home
          </button>
          <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100">
            ⭐ Starred
          </button>
          <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100">
            👥 Workspaces
          </button>
          <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100">
            📤 Shared
          </button>
        </nav>
        <div className="p-4 space-y-2">
          <button className="w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
            Templates and apps
          </button>
          <button className="w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
            Marketplace
          </button>
          <button className="w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
            Import
          </button>
        </div>
        <div className="p-4">
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            + Create
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full max-w-sm px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button>❓</button>
            <button>🔔</button>
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white">
              S
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Build app card */}
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="font-medium">Build an app on your own</h2>
            <p className="text-sm text-gray-500">
              Start with a blank app and build your ideal workflow.
            </p>
          </div>

          {/* Opened section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Opened anytime
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded bg-green-600 text-white flex items-center justify-center font-bold">
                  Un
                </div>
                <div className="ml-3">
                  <p className="font-medium">Untitled Base</p>
                  <p className="text-xs text-gray-500">Opened 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
                  Un
                </div>
                <div className="ml-3">
                  <p className="font-medium">Untitled Base</p>
                  <p className="text-xs text-gray-500">Opened 16 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

