import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion =
  process.env.NOTION_API_KEY != null && process.env.NOTION_API_KEY.length > 0
    ? new Client({ auth: process.env.NOTION_API_KEY })
    : null;

export async function POST(request: Request) {
  if (!notion) {
    return NextResponse.json(
      { error: "Notion API no está configurada." },
      { status: 500 }
    );
  }

  let payload: { pageId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida. No se pudo leer el cuerpo." },
      { status: 400 }
    );
  }

  if (!payload.pageId) {
    return NextResponse.json(
      { error: "El identificador de la página es obligatorio." },
      { status: 400 }
    );
  }

  try {
    let nextCursor: string | undefined;
    let markdown: string | null = null;

    do {
      const response = await notion.blocks.children.list({
        block_id: payload.pageId,
        page_size: 100,
        start_cursor: nextCursor,
      });

      const markdownBlock = response.results.find(isMarkdownCodeBlock);

      if (markdownBlock) {
        markdown = markdownBlock.code.rich_text
          .map((item) => item.plain_text)
          .join("");
        break;
      }

      nextCursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (nextCursor);

    if (markdown == null) {
      return NextResponse.json(
        { error: "La página no contiene un bloque de markdown." },
        { status: 404 }
      );
    }

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Notion page fetch error:", error);
    const status =
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      { error: "No se pudo obtener el contenido de la página." },
      { status }
    );
  }
}

function isFullBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse
): block is BlockObjectResponse {
  return block.object === "block" && "type" in block;
}

function isMarkdownCodeBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse
): block is Extract<BlockObjectResponse, { type: "code" }> {
  return (
    isFullBlock(block) &&
    block.type === "code" &&
    block.code?.language === "markdown"
  );
}
