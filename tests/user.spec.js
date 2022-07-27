require("dotenv").config();

const dbService = require("../services/db.service");
const { login, register, logout } = require("../controllers/auth.controller");

describe("User auth controller", () => {
  beforeEach(async () => {

  })

  afterEach(async () => {

  })

  it("can create a new user", () => {

  });

  it("can login as a user", () => {

  });

  it("won't create a user with Invalid details", () => {

  });

  it("won't login with invalid details", () => {

  });

  it("can logout", () => {

  });
})
