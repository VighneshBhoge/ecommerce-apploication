import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAddresses(req, res, next) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const { label, line1, line2, city, state, zip, country, phone, isDefault } = req.body;
    if (!line1 || !city || !state || !zip || !phone) {
      return res.status(400).json({ error: "line1, city, state, zip and phone are required" });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label: label || "Home",
        line1,
        line2: line2 || null,
        city,
        state,
        zip,
        country: country || "India",
        phone,
        isDefault: !!isDefault,
      },
    });

    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Address not found" });
    }

    const { label, line1, line2, city, state, zip, country, phone, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: {
        ...(label !== undefined && { label }),
        ...(line1 !== undefined && { line1 }),
        ...(line2 !== undefined && { line2 }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(country !== undefined && { country }),
        ...(phone !== undefined && { phone }),
        ...(isDefault !== undefined && { isDefault: !!isDefault }),
      },
    });

    res.json({ address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: "Address deleted" });
  } catch (err) {
    next(err);
  }
}
