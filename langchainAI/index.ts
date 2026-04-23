import express from "express";
import cors from "cors";
import { key } from "./key.ts";
import { ChatDeepSeek } from "@langchain/deepseek";
import { createAgent } from "langchain";
const deepseek = new ChatDeepSeek({
  apiKey: key,
  model: "deepseek-chat",
  temperature: 1.3,
  maxTokens: 1000, //500-600个汉字
  topP: 1, //设得越小，AI 说话越"死板"；设得越大，AI 说话越"放飞自我"
  frequencyPenalty: 0, //防复读机诉 AI："你别老重复同一个词！"-2   2
  presencePenalty: 0, //鼓励换话题告诉 AI："别老聊同一件事！" -2   2
});
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const agent = createAgent({
    model: deepseek,
    systemPrompt: `你是一个聊天机器人，请根据用户的问题给出回答。`,
  });
  const result = await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: req.body.message,
        },
      ],
    },
    { streamMode: "messages" },
  );
  for await (const chunk of result) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }
  res.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
