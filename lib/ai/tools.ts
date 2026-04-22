import Anthropic from "@anthropic-ai/sdk";
import { mqlTrend, trafficTrend, pipelineTrend, adSpendByChannel, kpiData } from "@/lib/mock-data";

export type WidgetType = "bar" | "line" | "kpi_grid" | "table" | "spend_breakdown";

export interface Widget {
  type: WidgetType;
  title: string;
  data: Record<string, string | number>[];
  lines?: { key: string; color: string; label?: string }[];
  description?: string;
}

// Tool definitions sent to Claude
export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "get_kpi_summary",
    description: "Get the top-level KPI summary including MQLs, SQLs, pipeline, ad spend, ROAS, and organic sessions.",
    input_schema: {
      type: "object" as const,
      properties: {
        period: { type: "string", description: "The time period, e.g. 'this month', 'last 7 months'" },
      },
      required: [],
    },
  },
  {
    name: "get_mql_sql_trend",
    description: "Get the MQL and SQL trend over recent months.",
    input_schema: {
      type: "object" as const,
      properties: {
        chart_type: { type: "string", enum: ["bar", "line"], description: "Chart type to display" },
      },
      required: [],
    },
  },
  {
    name: "get_traffic_trend",
    description: "Get organic vs paid traffic trend over recent months.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_pipeline_trend",
    description: "Get pipeline generated and closed won trend over recent months.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_ad_spend_breakdown",
    description: "Get ad spend breakdown by channel (Meta, Google, LinkedIn, etc.).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "create_widget",
    description: "Create a chart or data widget to display visually to the user. Call this after fetching data to render it as a chart.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: ["bar", "line", "kpi_grid", "spend_breakdown"] },
        title: { type: "string" },
        data: { type: "array", items: { type: "object" } },
        lines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              color: { type: "string" },
              label: { type: "string" },
            },
          },
        },
        description: { type: "string", description: "Short description shown above the chart" },
      },
      required: ["type", "title", "data"],
    },
  },
];

// Tool execution — reads from mock data (will read from DB once integrations are live)
export function executeTool(
  name: string,
  input: Record<string, unknown>
): { result: unknown; widget?: Widget } {
  switch (name) {
    case "get_kpi_summary":
      return { result: kpiData };

    case "get_mql_sql_trend":
      return { result: mqlTrend };

    case "get_traffic_trend":
      return { result: trafficTrend };

    case "get_pipeline_trend":
      return { result: pipelineTrend };

    case "get_ad_spend_breakdown":
      return { result: adSpendByChannel };

    case "create_widget": {
      const widget: Widget = {
        type: (input.type as WidgetType) ?? "bar",
        title: (input.title as string) ?? "Chart",
        data: (input.data as Record<string, string | number>[]) ?? [],
        lines: input.lines as Widget["lines"],
        description: input.description as string | undefined,
      };
      return { result: "Widget created successfully", widget };
    }

    default:
      return { result: `Unknown tool: ${name}` };
  }
}
