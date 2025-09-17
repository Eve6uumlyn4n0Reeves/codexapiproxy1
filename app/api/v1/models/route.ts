import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: { message: "Missing or invalid authorization header", type: "authentication_error" } },
        { status: 401 },
      )
    }

    const apiKey = authHeader.substring(7)

    // Verify API key
    const user = await Database.findUserByApiKey?.(apiKey)
    if (!user) {
      return NextResponse.json({ error: { message: "Invalid API key", type: "authentication_error" } }, { status: 401 })
    }

    // Return available models (GPT-5 variants)
    const models = {
      object: "list",
      data: [
        {
          id: "gpt-5",
          object: "model",
          created: 1677610602,
          owned_by: "openai",
          permission: [],
          root: "gpt-5",
          parent: null,
        },
        {
          id: "gpt-5-turbo",
          object: "model",
          created: 1677610602,
          owned_by: "openai",
          permission: [],
          root: "gpt-5-turbo",
          parent: null,
        },
      ],
    }

    return NextResponse.json(models)
  } catch (error) {
    console.error("[v0] Models API error:", error)
    return NextResponse.json({ error: { message: "Internal server error", type: "server_error" } }, { status: 500 })
  }
}
