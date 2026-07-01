import { NextResponse } from "next/server";
import { prisma } from "@doora/database";
import { auth } from "@/lib/auth";
import { toPublicUser } from "@/lib/chat/users";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarColor: true,
          avatarId: true,
          status: true,
          statusMessage: true,
        },
      },
    },
    orderBy: { contact: { name: "asc" } },
  });

  return NextResponse.json({
    contacts: contacts.map((c) => toPublicUser(c.contact)),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contactId } = await request.json();
  if (!contactId) {
    return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  }
  if (contactId === session.user.id) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const contact = await prisma.user.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.contact.findUnique({
    where: {
      userId_contactId: { userId: session.user.id, contactId },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Contact already added" }, { status: 409 });
  }

  await prisma.contact.create({
    data: { userId: session.user.id, contactId },
  });

  return NextResponse.json(
    { contact: toPublicUser(contact) },
    { status: 201 },
  );
}
