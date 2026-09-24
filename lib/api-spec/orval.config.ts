import { defineConfig } from "orval";

export default defineConfig({
  client: {
    input: "./openapi.yaml",
    output: {
      target: "../api-client-react/src/generated/api.ts",
      schemas: "../api-client-react/src/generated/model",
      client: "react-query",
      httpClient: "fetch",
      baseUrl: "/api",
      clean: true,
      override: {
        mutator: { path: "../api-client-react/src/fetcher.ts", name: "customFetch" },
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
  zod: {
    input: "./openapi.yaml",
    output: {
      target: "../api-zod/src/generated/api.ts",
      client: "zod",
      override: { zod: { coerce: { query: true, param: true } } },
      clean: true,
    },
  },
});
