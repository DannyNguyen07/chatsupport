import { NextResponse } from "next/server"
import OpenAI from "openai";

const systemPrompt = "Hello! Welcome to Headstarter's customer support. I'm here to help you make the most out of your interview practice experience. Whether you have questions about how to use our platform, need assistance with technical issues, or want tips on getting the best out of your practice sessions, I'm here to assist you. How can I help you today?"

export async function POST(req){
    const openai = new OpenAI();
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {role: 'system', content: systemPrompt}, ...data],
        model: "gpt-4o-mini",
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion)
                {
                    const content = chunk.choices[0].delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (err)
            {
                controller.error(err)
            }
            finally
            {
                controller.close
            }
        }
    })
    return new NextResponse(stream)
}