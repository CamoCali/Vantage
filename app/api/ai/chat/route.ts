import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, executeTool, Widget } from "@/lib/ai/tools";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Vantage AI, an expert marketing analyst embedded inside the Vantage marketing platform.

Your job is to answer questions about marketing performance, campaign health, and channel effectiveness using the available data tools. You have access to:
- KPI summaries (MQLs, SQLs, pipeline, ad spend, ROAS)
- MQL/SQL trends over time
- Organic vs paid traffic trends
- Pipeline and closed won trends
- Ad spend breakdown by channel

When a user asks a question:
1. Identify which data tools you need to call
2. Call the relevant tools to fetch data
3. ALWAYS call create_widget to render a chart when you have trend or comparison data
4. Provide a concise, insight-driven answer — not just raw numbers

Be specific and actionable. Instead of just reporting numbers, highlight what's notable, what's improving, what needs attention, and what you'd recommend.

Format your text response in clear sections. Keep it focused — 2-4 paragraphs max.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const widgets: Widget[] = [];
        const toolResults: Anthropic.MessageParam[] = [...messages];

        // Agentic loop — Claude may call multiple tools before responding
        let continueLoop = true;
        while (continueLoop) {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: toolDefinitions,
            messages: toolResults,
          });

          if (response.stop_reason === "tool_use") {
            // Process all tool calls
            const toolUseBlocks = response.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );

            const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

            for (const toolUse of toolUseBlocks) {
              const { result, widget } = executeTool(
                toolUse.name,
                toolUse.input as Record<string, unknown>
              );

              if (widget) widgets.push(widget);

              toolResultContents.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: JSON.stringify(result),
              });
            }

            // Add assistant message and tool results to history
            toolResults.push({ role: "assistant", content: response.content });
            toolResults.push({ role: "user", content: toolResultContents });
          } else {
            // Final text response — stream it
            continueLoop = false;

            // Send widgets first
            if (widgets.length > 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "widgets", widgets })}\n\n`
                )
              );
            }

            // Stream text
            const textContent = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map((b) => b.text)
              .join("");

            // Stream word by word for a nice effect
            const words = textContent.split(" ");
            for (const word of words) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text: word + " " })}\n\n`
                )
              );
              await new Promise((r) => setTimeout(r, 12));
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
            );
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: String(err) })}\n\n`
          )
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
