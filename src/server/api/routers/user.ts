/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  onSignup: protectedProcedure.mutation(async ({ ctx }) => {
    const user = ctx.user;
    const existingUser = await ctx.db.user.findUnique({
      where: {
        email: user.email,
      },
    });
    console.log(`onSignup ${user.email}`);
    if (existingUser) {
      if (existingUser.id !== user.id) {
        await ctx.db.user.update({
          where: { email: user.email },
          data: { id: user.id },
        });
      }
      return;
    }

    await ctx.db.user.create({
      data: {
        id: user.id,
        email: user.email,
      },
    });
  }),
});
