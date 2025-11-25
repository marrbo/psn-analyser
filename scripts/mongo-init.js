// scripts/mongo-init.js
db = db.getSiblingDB('psn_analyser');

// Criar coleção de análises
db.createCollection('analyses');

// Criar índices para melhor performance
db.analyses.createIndex({ "accountId": 1 });
db.analyses.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.analyses.createIndex({ "createdAt": 1 });
db.analyses.createIndex({ "username": 1 });

print('✅ Banco de dados psn_analyser inicializado com sucesso!');
print('📊 Coleções criadas:');
db.getCollectionNames().forEach(collection => {
  print('   - ' + collection);
});