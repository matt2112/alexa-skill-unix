rm lambda.zip
cd lambda
zip -r ../lambda.zip *
cd ..
aws lambda update-function-code --function-name unixAlexaSkill --zip-file fileb://lambda.zip --profile matt
