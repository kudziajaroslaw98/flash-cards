import { createClient } from "#/shared/utils/supabase/server";
import { isLoggedIn } from "#/shared/utils/supabase/supabase-helpers";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json();
    const supabase = await createClient();

    if (await !isLoggedIn(supabase)) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "User not logged in",
            }),
        );
    }

    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });


    const result = streamText({
        model: openai('gpt-3.5-turbo-0125'),
        system:
            'You are expert in english vocabulary, you are generating descriptiops for texts. You always give unique and fitting descriptions. Do not use words from prompt to not give hints. ',
        prompt: prompt,
    });

    return result.toDataStreamResponse();
}
