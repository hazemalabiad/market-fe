import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Key } from "react";

// number of results per page
const LIMIT = 12;

export enum ItemType {
  mug = "mug",
  shirt = "shirt",
}

export type Product = {
  tags: Array<string>;
  price: number;
  name: string;
  description: string;
  slug: string;
  added: number;
  manufacturer: string;
  itemType: ItemType;
};

export type GetProductsListResponse = {
  per_page: number;
  total: number;
  total_pages: number;
  data: Product[];
};

export type Company = {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  account: number;
  contact: string;
};

export type GetCompaniesListResponse = {
  total: number;
  data: Record<string, Company>;
};

type GetProductsArgs = {
  page?: number | null;
  filters?: {
    itemType?: Key | null;
    tag?: string | null;
    manufacturers?: Array<string> | null;

    sorting?: {
      sortBy?: string | null;
      direction?: string | null;
    };
  };
};

export const serverApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "https://getir-market-be.herokuapp.com",
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsListResponse, GetProductsArgs | void>(
      {
        query: ({ page, filters }: GetProductsArgs) => {
          const pagination = page ? `_page=${page}&_limit=${LIMIT}` : "";

          const itemTypeFilter = filters?.itemType
            ? `&itemType=${filters.itemType}`
            : "";

          const orderByFilter = filters?.sorting?.direction || "asc";

          const sortByFilter = filters?.sorting?.sortBy
            ? `&_sort=${filters.sorting.sortBy}&_order=${orderByFilter}`
            : "";

          const manufacturersFilter = filters?.manufacturers
            ? filters.manufacturers
                .map((manufacturer) => `&manufacturer=${manufacturer}`)
                .join("")
            : "";

          const tagFilter = filters?.tag ? `&tags_like=${filters.tag}` : "";

          return `items?${pagination}${itemTypeFilter}${sortByFilter}${manufacturersFilter}${tagFilter}`;
        },
        transformResponse: (data: Array<Product>, meta) => {
          const total = Number(meta?.response?.headers.get("X-Total-Count"));

          return {
            data,
            total,
            per_page: LIMIT,
            total_pages: Math.ceil(total / LIMIT),
          };
        },
      }
    ),
    getCompanies: builder.query<GetCompaniesListResponse, void>({
      query: () => "companies",
      transformResponse: (data: Array<Company>) => ({
        data: Object.fromEntries(
          data.map((company) => [company.slug, company])
        ),
        total: data.length,
      }),
    }),
  }),
});

export const { useGetProductsQuery, useGetCompaniesQuery } = serverApi;
