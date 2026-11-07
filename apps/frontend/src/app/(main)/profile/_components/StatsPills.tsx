import { ProfileStats } from "@/types"
import Image from "next/image"

function Pill({ bg, icon, value }: { bg: string; icon: React.ReactNode; value: number }) {
  return (
    <div
      className="flex-1 h-[58px] rounded-2xl flex items-center justify-center gap-3 text-white"
      style={{ background: bg }}
    >
      {icon}
      <span className="text-sm font-semibold leading-none">{value}</span>
    </div>
  )
}

export function StatsPills({ stats }: { stats: ProfileStats }) {
  return (
    <div className="flex gap-2 w-full">
      <Pill
        bg="#9957FF"
        icon={<Image src="/tick-paper.svg" alt="reward" width={25} height={26} />}
        value={stats.totalTasksCompleted ?? 0}
      />
      <Pill
        bg="#47C3E9"
        icon={<Image src="/again.svg" alt="reward" width={30} height={34} />}
        value={stats.totalHabitsCompleted ?? 0}
      />
      <Pill
        bg="#F23B54"
        icon={<Image src="/fire.svg" alt="reward" width={24} height={26} />}
        value={stats.currentStreak ?? 0}
      />
      <Pill
        bg="#FBCD63"
        icon={<Image src="/reward.svg" alt="reward" width={22} height={26} />}
        value={stats.totalBadges ?? 0}
      />
    </div>
  )
}
