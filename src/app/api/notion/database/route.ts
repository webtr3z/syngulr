import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type {
  NotionListRequest,
  NotionPage,
} from "@/types/notion";

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

  let payload: NotionListRequest;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida. No se pudo leer el cuerpo." },
      { status: 400 }
    );
  }

  if (!payload.databaseId) {
    return NextResponse.json(
      { error: "El identificador de la base de datos es obligatorio." },
      { status: 400 }
    );
  }

  const { databaseId, filter, sorts, limit } = payload;

  const query: QueryDatabaseParameters = {
    database_id: databaseId,
    filter,
    sorts,
    page_size: limit,
  };

  try {
    const response = await notion.databases.query(query);
    const items: NotionPage[] = response.results
      .filter(
        (item): item is PageObjectResponse =>
          item.object === "page"
      )
      .map(mapPageToItem);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Notion query error:", error);
    const status =
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      { error: "No se pudieron obtener los datos de Notion." },
      { status }
    );
  }
}

function mapPageToItem(page: PageObjectResponse): NotionPage {
  const properties = Object.values(page.properties);

  const titleProperty = properties.find(
    (property): property is Extract<
      typeof property,
      { type: "title" }
    > => property.type === "title"
  );

  const descriptionProperty = properties.find(
    (property): property is Extract<
      typeof property,
      { type: "rich_text" }
    > => property.type === "rich_text"
  );

  const statusProperty = properties.find(
    (property): property is Extract<
      typeof property,
      { type: "status" }
    > => property.type === "status"
  );

  const tagsProperty = properties.find(
    (property): property is Extract<
      typeof property,
      { type: "multi_select" }
    > => property.type === "multi_select"
  );

  return {
    id: page.id,
    title: titleProperty
      ? extractPlainText(titleProperty.title)
      : "Sin título",
    description: descriptionProperty
      ? undefinedIfEmpty(extractPlainText(descriptionProperty.rich_text))
      : undefined,
    status: statusProperty?.status?.name ?? undefined,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    url: page.url,
    tags: tagsProperty?.multi_select
      ?.map((tag) => tag?.name)
      .filter((tag): tag is string => Boolean(tag) && tag.length > 0),
    icon:
      page.icon?.type === "emoji"
        ? page.icon.emoji ?? undefined
        : undefined,
  };
}

function extractPlainText(text: RichTextItemResponse[]): string {
  return text.map((item) => item.plain_text).join("").trim();
}

function undefinedIfEmpty(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

