import { getAvatarUrl } from "@/lib/chat/avatar-url";

type AvatarProps = {
  name: string;
  color?: string;
  avatarId?: string | null;
  size?: "sm" | "md" | "lg";
  status?: string;
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function ChatAvatar({ name, color, avatarId, size = "md", status }: AvatarProps) {
  const avatarUrl = getAvatarUrl(avatarId);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusColors: Record<string, string> = {
    online: "bg-green-400",
    offline: "bg-slate-500",
    away: "bg-yellow-400",
  };

  return (
    <div className="relative inline-flex shrink-0">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div
          className={`${sizes[size]} flex items-center justify-center rounded-full font-semibold text-white`}
          style={{ backgroundColor: color || "#6366f1" }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-800 ${
            statusColors[status] || statusColors.offline
          }`}
        />
      )}
    </div>
  );
}
