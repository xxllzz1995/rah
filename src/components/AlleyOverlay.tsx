/**
 * 神秘小巷场景：氛围文字 + 未来剧情钩子。
 */
export function AlleyOverlay() {
  return (
    <div className="px-5 pb-6 space-y-4">
      <div className="text-center pt-2">
        <div className="text-lg text-red-300/80">??? 小巷</div>
        <div className="text-[10px] text-red-500/40 tracking-widest mt-1">
          NO SIGNAL ZONE
        </div>
      </div>

      <div className="text-xs text-red-200/50 leading-relaxed space-y-3">
        <p>
          你走进两栋楼之间的缝隙。空气立刻变了——潮湿的，带着铁锈和某种你说不出来的甜味。
        </p>
        <p>
          手机信号在你迈入第三步的时候断了。管家的语音变成了一阵白噪声，然后是沉默。
        </p>
        <p>
          巷子深处有微弱的红光。不是霓虹灯——它在脉动，像呼吸。
        </p>
        <p>
          墙上用不知道什么东西写着几个字。你凑近看——
        </p>
        <p className="text-center text-red-400/70 text-sm font-mono tracking-widest py-2">
          「 你也是被租出去的吗？ 」
        </p>
        <p className="text-red-300/30 italic">
          你突然很想离开这里。
        </p>
      </div>

      <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-[10px] text-red-400/40 text-center">
        这个地方似乎还没准备好让你深入……
      </div>
    </div>
  );
}
