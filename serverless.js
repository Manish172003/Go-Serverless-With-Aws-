const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});
const dynamodbTableName = "employee-table";
const dynamodb = new AWS.DynamoDB.DocumentClient();

const employeepath = "/employees";
const healthpath = "/healthpath";

exports.handler = async (event) => {
  let response;
  console.log(response);
  switch (true) {
    case event.httpMethod === "POST":
      response = await saveEmployee(JSON.parse(event.body));
      break;
    case event.httpMethod === "GET":
      response = await getEmployees();
      break;
  }
  return response;
};

async function saveEmployee(requestBody) {
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          Operation: "SAVE",
          Message: "SUCCESS",
          Item: requestBody,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error(
          "Do your custom error handling here. I am just gonna log it: ",
          error
        );
      }
    );
}

async function getEmployees() {
  const params = {
    TableName: dynamodbTableName,
  };
  const allEmployees = await scanDynamoRecords(params, []);
  const body = {
    employees: allEmployees,
  };
  return buildResponse(200, body);
}

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch (error) {
    console.error(
      "Do your custom error handling here. I am just gonna log it: ",
      error
    );
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
