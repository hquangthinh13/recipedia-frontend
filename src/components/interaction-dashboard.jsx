"use client";

import * as React from "react";
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

export default function InteractionDashboard() {
  const { user } = useAuth();
  const [range, setRange] = React.useState("7");
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get(
        `/users/${user.id}/interactions-summary?range=${range}`
      );
      setData(data.data || []);
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
      <CardHeader className="flex items-center gap-2 space-y-0 border-b sm:flex-row">
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

      <CardContent className="">
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
