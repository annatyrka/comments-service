const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// we need to know the id of the comment we associate this post with
app.post("/posts/:id/comments", (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;

  axios
    .post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    })
    .catch((error) => console.log(error));

  res.status(201).send({ commentId, content });
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  console.log("Received Event: ", type);
  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;

    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.commentId === id);
    comment.status = status;

    axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }

  res.send({ status: "OK" });
});

// make sure that the application listens on some port

app.listen(4001, () => {
  console.log("Listening on 4001");
});
