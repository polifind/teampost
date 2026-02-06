import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  console.log("\n=== All Users ===\n");
  console.log(`Total: ${users.length} users\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || "(no name)"}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Posts: ${user._count.posts}`);
    console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
    console.log("");
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
