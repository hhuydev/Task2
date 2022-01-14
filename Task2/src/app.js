const express = require("express");
const AWS = require("aws-sdk");
const HttpError = require("./util/http-error");
const cors = require("cors");

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

const config_aws = new AWS.Config({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});
AWS.config = config_aws;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "Users";

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.get("/api/users", (req, res) => {
  if (req.query.username) {
    const username = req.query.username;
    const params = {
      TableName: tableName,
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    docClient.scan(params, (err, data) => {
      if (err) res.status(500).json({ message: err.message });
      else {
        return res.status(200).json({ data: data.Items });
      }
    });
  } else if (req.query.email) {
    const email = req.query.email;
    const params = {
      TableName: tableName,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    docClient.scan(params, (err, data) => {
      if (err) res.status(500).json({ message: err.message });
      else {
        return res.status(200).json({ data: data.Items });
      }
    });
  } else {
    const params = {
      TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
      if (err) res.status(500).json({ error: err.message });
      else {
        return res.status(200).json({ data: data.Items });
      }
    });
  }
});

app.post("/api/users/update/:id", (req, res) => {
  const { username, email, birthdate } = req.body;
  console.log(username);
  console.log(email);
  console.log(birthdate);

  const { id } = req.params;

  let params = {
    TableName: tableName,
    Key: {
      id,
    },
    UpdateExpression: "set #username = :u, #email = :e, #birthdate = :b",
    ExpressionAttributeNames: {
      "#username": "username",
      "#email": "email",
      "#birthdate": "birthdate",
    },
    ExpressionAttributeValues: {
      ":u": username,
      ":e": email,
      ":b": birthdate,
    },
    ReturnValues: "UPDATED_NEW",
  };
  docClient.update(params, (err, data) => {
    if (err) res.status(500).json({ message: err.message });
    else return res.status(200).json({ user: data.Attributes });
  });
});

app.use((req, res, next) => {
  throw new HttpError("Invalid route", 404);
});

app.listen(port, () => console.log("Server is up on port " + port));
