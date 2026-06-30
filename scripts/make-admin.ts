/**
 * Promote a user to ADMIN by email.
 * Usage: npm run make-admin -- user@example.com
 */
import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  if (user.role === "ADMIN") {
    console.log(`${email} is already an ADMIN.`);
    return;
  }
  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${email} has been promoted to ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
