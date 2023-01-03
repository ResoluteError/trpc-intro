import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "./server";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
      headers: {
        authorization: "0",
      },
    }),
  ],
});

async function main() {
  await client.getUserById
    .query({ id: 0 })
    .then((user) => console.log("Get user by id:", user));
  await client.createUser
    .mutate({ name: "Bob" })
    .then((user) => console.log("Created user:", user));
  await client.listUsers // client.users.list
    .query()
    .then((users) => console.log("List of users:", users));
}

main();
