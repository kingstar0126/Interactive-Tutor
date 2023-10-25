# Database connection parameters
USER=postgres
PASS=postgres
DBNAME=postgres
HOST=localhost

# Command to check PostgreSQL connection
PGPASSWORD=$PASS psql -U $USER -d $DBNAME -h $HOST -c '\q'

if [ $? -ne 0 ]; then
    systemctl restart postgresql
fi