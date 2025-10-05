import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, MapPin, Leaf, Trash2, CheckCircle2 } from "lucide-react"
import type { Activity } from "@/lib/types"
import { formatRelativeTime } from "@/lib/mock-data"

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* User Header */}
        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
            <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{activity.userName}</p>
              {activity.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
          </div>
          <Badge variant={activity.type === "cleanup" ? "default" : "secondary"}>
            {activity.type === "cleanup" ? (
              <>
                <Trash2 className="mr-1 h-3 w-3" />
                Cleanup
              </>
            ) : (
              <>
                <Leaf className="mr-1 h-3 w-3" />
                Tree Planting
              </>
            )}
          </Badge>
        </div>

        {/* Activity Image */}
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={activity.imageUrl || "/placeholder.svg"}
            alt={activity.description}
            fill
            className="object-cover"
          />
        </div>

        {/* Activity Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base mb-1">{activity.description}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{activity.location}</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="flex items-center gap-4 text-sm">
            {activity.type === "cleanup" && activity.wasteCollected && (
              <div className="flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{activity.wasteCollected}kg</span>
                <span className="text-muted-foreground">waste collected</span>
              </div>
            )}
            {activity.type === "tree" && activity.treesPlanted && (
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="font-medium">{activity.treesPlanted}</span>
                <span className="text-muted-foreground">trees planted</span>
              </div>
            )}
          </div>

          {/* Tokens Earned */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <span className="text-lg">🪙</span>
              <span>+{activity.tokensEarned} tokens earned</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <Heart className="h-4 w-4" />
                <span>{activity.likes}</span>
              </button>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span>{activity.comments}</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
