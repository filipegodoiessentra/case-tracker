// Script de seed para quando DATA_SOURCE=prisma (PostgreSQL real).
// Reaproveita os mesmos dados mock usados no modo de demonstração em memória.
import { PrismaClient } from '@prisma/client';
import * as mock from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const user of mock.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  for (const customer of mock.customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }

  for (const c of mock.cases) {
    await prisma.case.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        customerId: c.customerId ?? undefined,
        country: c.country ?? undefined,
        region: c.region ?? undefined,
        salesOwner: c.salesOwner ?? undefined,
        type: c.type,
        origin: c.origin ?? undefined,
        status: c.status,
        priority: c.priority,
        comments: c.comments ?? undefined,
        customerGroup: c.customerGroup ?? undefined,
        salesOrder: c.salesOrder ?? undefined,
        purchaseOrder: c.purchaseOrder ?? undefined,
        material: c.material ?? undefined,
        partNumber: c.partNumber ?? undefined,
        shipFrom: c.shipFrom ?? undefined,
        shipTo: c.shipTo ?? undefined,
        incoterm: c.incoterm ?? undefined,
        shipDate: c.shipDate ? new Date(c.shipDate) : undefined,
        tracking: c.tracking ?? undefined,
        internalOwner: c.internalOwner ?? undefined,
        managerOwner: c.managerOwner ?? undefined,
        dueDate: c.dueDate ? new Date(c.dueDate) : undefined,
        ownerId: c.ownerId ?? undefined,
        tags: {
          connectOrCreate: c.tags.map((t) => ({ where: { name: t }, create: { name: t } })),
        },
      },
    });
  }

  for (const article of mock.knowledgeArticles) {
    await prisma.knowledgeArticle.upsert({
      where: { id: article.id },
      update: {},
      create: {
        id: article.id,
        title: article.title,
        contentMarkdown: article.contentMarkdown,
        category: article.category,
        tags: {
          connectOrCreate: article.tags.map((t) => ({ where: { name: t }, create: { name: t } })),
        },
      },
    });
  }

  for (const process of mock.processes) {
    await prisma.processDoc.upsert({
      where: { id: process.id },
      update: {},
      create: process,
    });
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
