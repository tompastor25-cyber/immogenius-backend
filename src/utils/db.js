// Connexion Prisma et gestion de la base de données

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
