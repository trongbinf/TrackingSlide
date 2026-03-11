'use client';

import { useState, useEffect } from 'react';

interface Unit {
  id: string;
  name: string;
  total_opens: number;
  last_open: string | null;
}

interface Log {
  timestamp: string;
  ip: string;
  device: string;
  os: string;
  browser: string;
}

export default function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<'create' | 'logs' | null>(null);
  const [activeUnit, setActiveUnit] = useState<{ id: string, name: string } | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newName, setNewName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [errorObj, setErrorObj] = useState<{message: string, url?: string} | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUnits(data);
        setErrorObj(null);
      } else {
        console.error('Error fetching stats:', data);
        setUnits([]);
        if (data.details?.includes('FAILED_PRECONDITION: The query requires an index')) {
          const urlMatch = data.details.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/);
          setErrorObj({
            message: 'Thiếu Index trên Firebase. Vui lòng bấm vào link bên dưới để tạo (chỉ mất 1-2 phút):',
            url: urlMatch ? urlMatch[1] : undefined
          });
        } else {
          setErrorObj({ message: data.details || data.error || 'Server Error' });
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorObj({ message: 'Lỗi kết nối API' });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const createUnit = async () => {
    if (!newName) return showToast('Vui lòng nhập tên slide');
    await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    setModalOpen(null);
    fetchStats();
    showToast('Đã tạo tracker thành công!');
  };

  const openLogs = async (id: string, name: string) => {
    setActiveUnit({ id, name });
    setModalOpen('logs');
    setLogs([]);
    const res = await fetch(`/api/logs/${id}`);
    const data = await res.json();
    setLogs(data);
  };

  const copyPixel = (id: string) => {
    const url = `${window.location.origin}/api/t/${id}`;
    navigator.clipboard.writeText(url);
    showToast('Đã copy Link Pixel!');
  };

  const totalTrackers = units.length;
  const totalOpens = units.reduce((acc, u) => acc + u.total_opens, 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              SlideTrack <span className="text-indigo-500">Pro</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Hệ thống phân tích lượt xem Google Slides chuyên nghiệp</p>
          </div>
          <button 
            onClick={() => setModalOpen('create')}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-indigo-500/20"
          >
            + Tạo Tracker mới
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Số lượng Tracker</p>
            <h2 className="text-4xl font-bold mt-2 text-indigo-400">{totalTrackers}</h2>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Tổng lượt mở Slide</p>
            <h2 className="text-4xl font-bold mt-2 text-emerald-400">{totalOpens}</h2>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Tên Slide</th>
                  <th className="px-6 py-4">ID Theo dõi</th>
                  <th className="px-6 py-4">Lượt mở</th>
                  <th className="px-6 py-4">Hoạt động cuối</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{u.name}</td>
                    <td className="px-6 py-4">
                      <code className="bg-black/40 px-2 py-1 rounded text-indigo-300 text-sm">{u.id}</code>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{u.total_opens}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {u.last_open ? new Date(u.last_open).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button 
                        onClick={() => copyPixel(u.id)}
                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                      >
                        Copy Link
                      </button>
                      <button 
                        onClick={() => openLogs(u.id, u.name)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                      >
                        Nhật ký
                      </button>
                    </td>
                  </tr>
                ))}
                {units.length === 0 && !loading && !errorObj && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Chưa có tracker nào. Hãy tạo một cái để bắt đầu!
                    </td>
                  </tr>
                )}
                {errorObj && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl inline-block text-left max-w-3xl">
                        <p className="font-bold mb-2 text-red-400">⚠️ Không thể tải dữ liệu Firestore</p>
                        <p className="text-sm text-red-300 mb-4">{errorObj.message}</p>
                        {errorObj.url && (
                          <a href={errorObj.url} target="_blank" rel="noreferrer" className="inline-block bg-white text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all shadow-lg">
                            👉 Bấm vào đây để tạo Index tự động
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center text-slate-500 text-xs">
          Built with Next.js & Firebase &bull; SlideTrack Pro &copy; 2026
        </footer>
      </div>

      {/* Create Modal */}
      {modalOpen === 'create' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 italic text-indigo-400">Tạo Tracker mới</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tên Slide / Chiến dịch kinh doanh</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Báo cáo Marketing Q1" 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setModalOpen(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={createUnit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Tạo ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {modalOpen === 'logs' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-4xl max-h-[85vh] p-8 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-100">
                Nhật ký: <span className="text-indigo-400">{activeUnit?.name}</span>
              </h2>
              <button onClick={() => setModalOpen(null)} className="text-slate-400 hover:text-white p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-black/20">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[#0f172a] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase text-[10px]">Thời gian</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase text-[10px]">IP Address</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase text-[10px]">Thiết bị</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase text-[10px]">HĐH / Trình duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-300">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-300">{log.ip}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{log.device}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {log.os} / {log.browser}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-600 italic">Chưa có dữ liệu truy cập</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={() => setModalOpen(null)}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 transition-all duration-300 transform ${toast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/20 p-1 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        {toast}
      </div>
    </div>
  );
}
