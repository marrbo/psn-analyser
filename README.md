# Verificar se o MongoDB está rodando
docker-compose ps

# Verificar logs do MongoDB
docker-compose logs mongodb

# Executar script de verificação do banco
npx tsx scripts/check-db.ts

# Acessar o MongoDB via shell
docker-compose exec mongodb mongosh -u root -p example --authenticationDatabase admin psn_analyser

# No shell do MongoDB, verificar análises:
db.analyses.find().pretty()


# Testar health check
curl http://localhost:3000/api/health

# Testar busca de análise (substitua pelo ID real)
curl "http://localhost:3000/api/analyses/6924eb9f2c09ff2054cfc78f"


npx tsx scripts/check-data-structure.ts 6924eb9f2c09ff2054cfc78f


# Execute o script de migração para corrigir os dados existentes
npx tsx scripts/migrate-data.ts