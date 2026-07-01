import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ contactId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contactId } = await params;

  await prisma.contact.deleteMany({
    where: { userId: session.user.id, contactId },
  });

  return NextResponse.json({ success: true });
}
