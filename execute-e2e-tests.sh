echo Running execute-e2e-tests script

echo Updating dependencies
npm install

echo Launching docker-compose environment
docker-compose up -d --build

echo Executing tests
npx cypress run --spec "cypress/integration/**/*.spec.js"

echo Cleaning docker-compose environment
docker-compose down
