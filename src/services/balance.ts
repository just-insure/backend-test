import httpClient from "./http-client";

export const charge = (amount: number) =>
  httpClient.post("https://balance.example.com", { amount });
