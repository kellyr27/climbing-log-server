import supertest from "supertest";
import app from "../../app.js";
import { expect } from 'chai';
import { connectDB, disconnectDB } from "../../configs/db.config.js";

const request = supertest(app);

describe("User routes", () => {

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });


  it("should register a user", async () => {
    const res = await request.post("/api/users").send({
      username: "testuser",
      password: "password",
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("token");
  })

  it("should login a user", async () => {
    const res = await request.post("/api/users/login").send({
      username: "testuser",
      password: "password",
    });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  })

  it("should not login a user with wrong password", async () => {
    const res = await request.post("/api/users/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(res.status).to.equal(401);
  })

  it("should not login a user that does not exist", async () => {
    const res = await request.post("/api/users/login").send({
      username: "nonexistentuser",
      password: "password",
    });

    expect(res.status).to.equal(404);
  })

  it("should not register a user with an existing username", async () => {
    const res = await request.post("/api/users").send({
      username: "testuser",
      password: "password",
    });

    expect(res.status).to.equal(400);
  })

  it("should not register a user without a username", async () => {
    const res = await request.post("/api/users").send({
      password: "password",
    });

    expect(res.status).to.equal(400);
  })

  it("should not register a user without a password", async () => {
    const res = await request.post("/api/users").send({
      username: "testuser",
    });

    expect(res.status).to.equal(400);
  })

  it("should not login a user without a username", async () => {
    const res = await request.post("/api/users/login").send({
      password: "password",
    });

    expect(res.status).to.equal(400);
  })

  it("should not login a user without a password", async () => {
    const res = await request.post("/api/users/login").send({
      username: "testuser",
    });

    expect(res.status).to.equal(400);
  })

  it("should not register a user with a short password", async () => {
    const res = await request.post("/api/users").send({
      username: "testuser",
      password: "pass",
    });

    expect(res.status).to.equal(400);
  })


});