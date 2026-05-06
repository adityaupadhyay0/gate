import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Precomputation Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Batch Jobs</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold">PYQ Tagging</p>
                <p className="text-xs text-gray-500">Run Gemini to tag all untagged PYQs</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Run</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold">Topic Summaries</p>
                <p className="text-xs text-gray-500">Regenerate all topic summaries</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Run</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold">Resource Curation</p>
                <p className="text-xs text-gray-500">Refresh YT/Book links</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Run</button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tagged PYQs</span>
              <span className="font-bold text-green-600">100%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Summarized Topics</span>
              <span className="font-bold text-green-600">100%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gemini API</span>
              <span className="font-bold text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
