import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  Plus,
  Trash2,
  Code,
  Save,
  Info,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDMAuth } from '../../context/DMAuthContext';

export default function DMDashboard() {
  const { settings, updateGeneralSettings } = useStore();
  const { dmUser, logout } = useDMAuth();
  const navigate = useNavigate();
  
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptCode, setNewScriptCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const scripts = settings?.trackingScripts || [];

  const handleAddScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScriptName || !newScriptCode) return;
    
    setLoading(true);
    const newScript = {
      id: Date.now().toString(),
      name: newScriptName,
      code: newScriptCode
    };

    try {
      await updateGeneralSettings({
        trackingScripts: [...scripts, newScript]
      });
      setNewScriptName('');
      setNewScriptCode('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to add script');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script? This will remove it from the live website.')) return;
    
    setLoading(true);
    try {
      await updateGeneralSettings({
        trackingScripts: scripts.filter(s => s.id !== id)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to delete script');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/dm/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Professional Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-gray-700" />
            <span className="font-bold text-gray-900 tracking-tight">DM Team Dashboard</span>
            <div className="h-4 w-px bg-gray-200 mx-2" />
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
              Signed in as: {dmUser?.name}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-600 hover:text-red-600 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tracking Code Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add or remove Google Analytics, Meta Pixel, and other SEO tracking codes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Script Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" /> Add New Script
                </h2>
              </div>
              <form onSubmit={handleAddScript} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Script Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Analytics"
                    value={newScriptName}
                    onChange={e => setNewScriptName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Paste Code Snippet</label>
                  <textarea
                    rows={10}
                    placeholder="<script>...</script>"
                    value={newScriptCode}
                    onChange={e => setNewScriptCode(e.target.value)}
                    className="w-full font-mono text-[13px] border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Add to Website
                    </>
                  )}
                </button>
                {saved && (
                  <p className="text-center text-xs text-green-600 font-bold animate-fade-in flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Script Added Successfully
                  </p>
                )}
              </form>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Note:</strong> Paste the full script tag including <code>&lt;script&gt;</code> tags. These will be injected into the website head automatically.
              </p>
            </div>
          </div>

          {/* Scripts List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-600" /> Active Tracking Scripts ({scripts.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {scripts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Code className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No scripts have been added yet.</p>
                  </div>
                ) : (
                  scripts.map((script) => (
                    <div key={script.id} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {script.name}
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          </h3>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Active Global Snippet</p>
                        </div>
                        <button
                          onClick={() => handleDeleteScript(script.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                          title="Delete Script"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-300 p-4 rounded-md text-[12px] font-mono overflow-x-auto max-h-[150px] custom-scrollbar">
                          <code>{script.code}</code>
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded font-bold uppercase">Code Block</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">
          <p>© 2026 Al Zaydan International</p>
          <p className="flex items-center gap-2">
            <Shield className="w-3 h-3" /> Secure Admin Access
          </p>
        </div>
      </footer>
    </div>
  );
}
