function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl border border-emerald-500/30 bg-black/40 rounded-md shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        {/* 终端标题栏 */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-500/30 bg-emerald-500/5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-emerald-400/70 tracking-widest">
            RAH://terminal — session_001
          </span>
        </div>

        {/* 终端正文 */}
        <div className="p-6 space-y-2 text-sm leading-relaxed text-emerald-300">
          <p className="text-emerald-500/60">[ booting RAH platform v0.0.1 ... ]</p>
          <p className="text-emerald-500/60">[ verifying citizen credentials ... OK ]</p>
          <p className="text-emerald-500/60">
            [ AI companion module: <span className="text-emerald-300">online</span> ]
          </p>
          <p className="pt-4">
            欢迎，<span className="text-white">访客</span>。
          </p>
          <p>
            您已被识别为：
            <span className="text-amber-300">非自愿失业人员 #A-7741</span>
          </p>
          <p className="pt-2 text-emerald-200">
            出租人类（Rent-A-Human）平台正在为您匹配可用任务...
          </p>
          <p className="pt-4 text-emerald-500/40 italic">
            &gt; 项目骨架运行成功，等待接入 AI 管家
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
