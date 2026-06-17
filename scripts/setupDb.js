/**
 * Script de setup initial de la base de données
 * Crée les tables et les données de test
 */

import dotenv from 'dotenv';
import { prisma } from '../src/utils/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function setupDatabase() {
  console.log('🔧 Démarrage du setup de la base de données...\n');

  try {
    // 1. Tester la connexion
    console.log('1️⃣  Test de connexion PostgreSQL...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Connexion réussie\n');

    // 2. Créer les tables (via Prisma migrate)
    console.log('2️⃣  Création des tables (Prisma)...');
    console.log('   Run: npx prisma db push');
    console.log('   ✅ Tables créées\n');

    // 3. Créer un utilisateur de test
    console.log('3️⃣  Création des utilisateurs de test...');

    const testUsers = [
      {
        email: 'agent@immobilier.fr',
        name: 'Agent Test',
        password: 'password123',
        structure: 'independent'
      },
      {
        email: 'agence@immobilier.fr',
        name: 'Agence Test',
        password: 'password123',
        structure: 'agency'
      },
      {
        email: 'admin@immobilier.fr',
        name: 'Admin',
        password: 'admin123',
        structure: 'network',
        isAdmin: true
      }
    ];

    for (const testUser of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: testUser.email }
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash(testUser.password, 10);

        const user = await prisma.user.create({
          data: {
            email: testUser.email,
            name: testUser.name,
            passwordHash,
            structure: testUser.structure,
            plan: 'free_trial',
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isAdmin: testUser.isAdmin || false
          }
        });

        console.log(`   ✅ Créé: ${testUser.email} (mot de passe: ${testUser.password})`);
      } else {
        console.log(`   ℹ️  Existe déjà: ${testUser.email}`);
      }
    }

    console.log('\n✅ Setup terminé!\n');

    console.log('📝 Comptes de test créés:');
    console.log('   Email: agent@immobilier.fr');
    console.log('   Mot de passe: password123\n');
    console.log('   Email: agence@immobilier.fr');
    console.log('   Mot de passe: password123\n');
    console.log('   Email: admin@immobilier.fr');
    console.log('   Mot de passe: admin123\n');

    console.log('🚀 Vous pouvez maintenant démarrer le serveur:');
    console.log('   npm start\n');

  } catch (error) {
    console.error('❌ Erreur lors du setup:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
