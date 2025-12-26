import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/users/audits')
      .then((res) => setAudits(res.data.data.audits))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Audit Logs</h1>
      {loading ? (
        <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : audits.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center">No audit logs.</div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400">When</th>
                <th className="px-4 py-3 text-left text-gray-400">Actor</th>
                <th className="px-4 py-3 text-left text-gray-400">Action</th>
                <th className="px-4 py-3 text-left text-gray-400">Target</th>
                <th className="px-4 py-3 text-left text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a: any) => (
                <tr key={a._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-400">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white">{a.actor}</td>
                  <td className="px-4 py-3 text-gray-300">{a.action}</td>
                  <td className="px-4 py-3 text-gray-300">{a.targetType} {a.targetId}</td>
                  <td className="px-4 py-3 text-gray-400">{JSON.stringify(a.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
