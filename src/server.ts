import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import express from "express";
import { z } from "zod";
import * as trpcExpress from "@trpc/server/adapters/express";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// Create a user
type User = {
  id: number;
  name: string;
};

const userList: User[] = [
  {
    id: 0,
    name: "John",
  },
];

const createContext = (opts: CreateExpressContextOptions) => {
  const userId = opts.req.headers.authorization;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No userId was provided",
    });
  }

  const user = userList.find((user) => user.id === +userId);

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No matching user was found",
    });
  }

  return {
    ...opts,
    user,
  };
};

const trpc = initTRPC
  .context<inferAsyncReturnType<typeof createContext>>()
  .create();

const appRouter = trpc.router({
  listUsers: trpc.procedure.query(({ ctx }) => {
    console.log("Requesting user: ", ctx.user.name);
    return userList;
  }),
  getUserById: trpc.procedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      return userList.find((user) => user.id === input.id);
    }),
  createUser: trpc.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newUser: User = {
        name: input.name,
        id: userList[userList.length - 1].id + 1,
      };
      userList.push(newUser);
      return newUser;
    }),
});

const app = express();

export type AppRouter = typeof appRouter;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(3000, () => console.log("App is running on port 3000"));
