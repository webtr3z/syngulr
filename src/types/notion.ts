import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

export interface NotionPage {
  id: string;
  title: string;
  description?: string;
  status?: string;
  createdTime: string;
  lastEditedTime: string;
  url: string;
  tags?: string[];
  icon?: string;
}

export type NotionFilter = QueryDatabaseParameters["filter"];
export type NotionSort = NonNullable<QueryDatabaseParameters["sorts"]>[number];

export interface NotionListRequest {
  databaseId: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  limit?: number;
}

