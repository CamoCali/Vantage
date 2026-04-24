import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { toolDefinitions, executeTool, buildContextSnapshot, Widget } from "@/lib/ai/tools";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASE_SYSTEM_PROMPT = `You are FlowDash AI, an expert marketing analyst embedded inside the FlowDash marketing execution platform.

Your job is to answer questions about marketing performance, campaigns, tasks, and channel effectiveness using the available data tools. You have access to:
- Live KPI data from connected integrations (HubSpot, GA4, Meta Ads, Google Ads, Salesforce)
- Campaign list, status, budgets, and task progress
- Metric trends over time for any connected integration
- Ad spend breakdowns by channel

When answering:
1. Call the relevant data tools first — never guess at numbers
2. Always call create_widget to render a chart when you have trend or comparison data worth visualising
3. Give a concise, insight-driven answer — highlight what's notable, improving, or needs attention
4. If data isn't available (integration not connected), say so and explain what connecting it would unlock
5. Reference specific campaign names and real numbers when available

Format: 2-4 short paragraphs. No headers. Be direct and actionable — you're a senior analyst, not a chatbot.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();
  const userId = session.user.id;

  const contextSnapshot = await buildContextSnapshot(userId);
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${contextSnapshot}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const widgets: Widget[] = [];
        const toolResults: Anthropic.MessageParam[] = [...messages];
        let continueLoop = true;

        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: systemPrompt,
            tools: toolDefinitions,
            messages: toolResults,
          });

          if (response.stop_reason === "tool_use") {
            const toolUseBlocks = response.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );

            const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

            for (const toolUse of toolUseBlocks) {
              const { result, widget } = await executeTool(
                toolUse.name,
                toolUse.input as Record<string, unknown>,
                userId
              );

              if (widget) {
                widgets.push(widget);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "widgets", widgets: [widget] })}\n\n`)
                );
              }

              toolResultContents.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: JSON.stringify(result),
              });
            }

            toolResults.push({ role: "assistant", content: response.content });
            toolResults.push({ role: "user", content: toolResultContents });
          } else {
            continueLoop = false;

            const textContent = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map((b) => b.text)
              .join("");

            const words = textContent.split(" ");
            for (const word of words) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text: word + " " })}\n\n`)
              );
              await new Promise((r) => setTimeout(r, 10));
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
