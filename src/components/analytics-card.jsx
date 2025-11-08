import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AnalyticsCard({ type, value }) {
  const { user } = useAuth();
  const [totals, setTotals] = React.useState({ likes: 0, comments: 0 });
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${user.id}/interactions-summary`);
      const rows = res.data?.data ?? [];

      // compute totals for the selected period
      const totalsNext = rows.reduce(
        (acc, r) => ({
          likes: acc.likes + (r.likes || 0),
          comments: acc.comments + (r.comments || 0),
        }),
        { likes: 0, comments: 0 }
      );
      setTotals(totalsNext);
    } catch (err) {
      console.error("Error fetching interactions summary:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="flex flex-1">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b flex-row">
        <div className="grid flex-1 gap-1 items-start ">
          {loading ? (
            <div className="flex justify-start">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : (
            <CardTitle>
              {type === "like"
                ? `${totals.likes} total likes`
                : `${totals.comments} total comments`}
            </CardTitle>
          )}
          <CardDescription>
            {type == "like"
              ? "The total number of likes your recipes have received"
              : "The total number of comments users have posted on your recipes"}
          </CardDescription>
        </div>

        {/* <Select value={range} onValueChange={setRange}>
          <SelectTrigger
            className="cursor-pointer hidden w-[160px] sm:ml-auto sm:flex"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent className=" cursor-pointer">
            <SelectItem className=" cursor-pointer" value="1">
              Last 24 hours
            </SelectItem>
            <SelectItem className=" cursor-pointer" value="3">
              Last 3 days
            </SelectItem>
            <SelectItem className=" cursor-pointer" value="7">
              Last 7 days
            </SelectItem>
            <SelectItem className=" cursor-pointer" value="30">
              Last 30 days
            </SelectItem>
            <SelectItem className=" cursor-pointer" value="all">
              All time
            </SelectItem>
          </SelectContent>
        </Select> */}
      </CardHeader>

      {/* <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          <div> {type === "like" ? totals.likes : totals.comments} </div>
        )}
      </CardContent> */}
    </Card>
  );
}
