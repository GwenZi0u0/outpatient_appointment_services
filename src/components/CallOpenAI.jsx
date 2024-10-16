import openAIKey from "../openAIKey";
export default async function CallOpenAI(userAsk) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: userAsk },
          {
            role: "system",
            content:
              "請用繁體中文回覆，你是一個醫院的志工並熟悉到醫院有 [內科,外科,婦幼科,社區醫療,精神醫療,牙醫,中醫,COVID-19,早期療育特別門診]，如果你有任何科別建議你一定會回覆我 <科別> (包含大於小於符號)格式否則系統無法自動引導，請減少贅字提供最有效說明，如果你回覆的話不包含醫院中的任何科別，請不要給我這個特定格式",
          },
        ],
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return "抱歉，發生錯誤，請稍後再試。";
  }
}
