import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const chartConfig = {
  likes: {
    label: "Likes",
    color: "var(--chart-1)",
  },
  comments: {
    label: "Comments",
    color: "var(--chart-2)",
  },
};

export default function UserInteractionDataCard() {
  const { user } = useAuth();
  const [range, setRange] = React.useState("7");
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const fillMissingDates = (rawData, range, userCreatedAt) => {
    const today = new Date();
    const result = [];

    let startDate;

    if (range === "all") {
      // Use user.createdAt if available, otherwise fallback to 30 days ago
      startDate = userCreatedAt ? new Date(userCreatedAt) : new Date();
      if (!userCreatedAt) startDate.setDate(today.getDate() - 30);
    } else {
      const days = parseInt(range, 10);
      startDate = new Date();
      startDate.setDate(today.getDate() - (days - 1));
    }

    // Loop from startDate → today inclusive
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const isoDate = d.toISOString().split("T")[0];
      const existing = rawData.find((item) => item.date.startsWith(isoDate));

      result.push({
        date: isoDate,
        likes: existing?.likes ?? 0,
        comments: existing?.comments ?? 0,
      });
    }

    return result;
  };

  const fetchData = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get(
        `/users/${user.id}/interactions-summary?range=${range}`
      );
      const raw = data.data || [];
      const filled = fillMissingDates(raw, range, user?.createdAt);
      setData(filled);
    } catch (err) {
      console.error("Error fetching interactions summary:", err);
    } finally {
      setLoading(false);
    }
  }, [user, range]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>User Interactions</CardTitle>
          <CardDescription>
            Likes and comments across your recipes
          </CardDescription>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger
            className="cursor-pointer hidden w-[160px] sm:ml-auto sm:flex"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent className=" cursor-pointer">
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
        </Select>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-likes)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-likes)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillComments" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-comments)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-comments)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="bg-white border shadow-sm rounded-lg"
                    config={chartConfig}
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />

              <Area
                type="natural"
                dataKey="likes"
                fill="url(#fillLikes)"
                stroke="var(--chart-1)"
                stackId="a"
                color="var(--chart-1)" // this will be read by tooltip
              />
              <Area
                type="natural"
                dataKey="comments"
                fill="url(#fillComments)"
                stroke="var(--chart-2)"
                stackId="a"
                color="var(--chart-2)" // this will be read by tooltip
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
