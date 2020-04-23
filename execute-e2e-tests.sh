echo Running execute-e2e-tests script
start=`date +%s`
HOMEDIR=$(pwd)
LOG="$HOMEDIR/pipeline.log"

echo Updating dependencies
npm install

echo Launching docker-compose environment
docker-compose up -d --build

echo Executing tests
npx cypress run --spec "cypress/integration/**/*.spec.js" --config video=false
testResult=$?

echo Cleaning docker-compose environment
docker-compose down

end=`date +%s`
[ $testResult -eq 0 ] && echo "e2e-tests execution time (seconds): $((end-start)) : pass" >> "$LOG" || echo "e2e-tests execution time (seconds): $((end-start)) : fail" >> "$LOG"

exit $testResult
