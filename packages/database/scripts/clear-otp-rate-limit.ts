import "dotenv/config";
import { prisma } from "../src/index.ts";

const email = process.argv[2]?.toLowerCase().trim();

if (!email) {
  console.error("Usage: npx tsx scripts/clear-otp-rate-limit.ts <email>");
  process.exit(1);
}

const deletedOtps = await prisma.emailOtp.deleteMany({ where: { email } });
const deletedPending = await prisma.pendingSignup.deleteMany({ where: { email } });
const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

console.log(`Cleared ${deletedOtps.count} OTP record(s) for ${email}`);
console.log(`Cleared ${deletedPending.count} pending signup(s) for ${email}`);
console.log(user ? "Note: user account already exists for this email." : "No existing user account.");

await prisma.$disconnect();
