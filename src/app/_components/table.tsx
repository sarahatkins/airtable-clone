// app/page.tsx
import { UserCircle2, Search, Plus, Settings, Upload } from 'lucide-react';

const AirTable = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold">Untitled Base</div>
        </div>
        <nav className="flex-1">
          <div className="text-sm font-medium text-gray-500 mb-2">Table 1</div>
          <button className="w-full text-left p-2 rounded hover:bg-gray-100">
            ➕ Create new...
          </button>
          <div className="mt-4 text-sm font-medium text-gray-500 mb-1">Views</div>
          <button className="w-full text-left p-2 rounded bg-gray-100 text-blue-600">
            ▣ Grid view
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between">
            <UserCircle2 className="w-6 h-6 text-gray-500" />
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 border px-3 py-1 rounded bg-white hover:shadow-sm">
              + Add or import
            </button>
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Trial: 14 days left</span>
            <button className="text-blue-600 font-medium hover:underline">See what's new</button>
            <button className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded">Share</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto bg-white rounded border">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 border-r w-10">
                  <input type="checkbox" />
                </th>
                <th className="p-2 border-r font-medium">Name</th>
                <th className="p-2 border-r font-medium">Notes</th>
                <th className="p-2 border-r font-medium">Assignee</th>
                <th className="p-2 border-r font-medium">Status</th>
                <th className="p-2 border-r font-medium">Attachments</th>
                <th className="p-2 font-medium">Attachment Submitted</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((num) => (
                <tr key={num} className="border-b hover:bg-gray-50">
                  <td className="p-2 border-r">
                    <input type="checkbox" />
                  </td>
                  <td className="p-2 border-r">{num}</td>
                  <td className="p-2 border-r" />
                  <td className="p-2 border-r" />
                  <td className="p-2 border-r" />
                  <td className="p-2 border-r" />
                  <td className="p-2 text-gray-400">Required field(s)</td>
                </tr>
              ))}
              <tr>
                <td colSpan={7} className="p-2 text-center text-gray-400">
                  +
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AirTable;