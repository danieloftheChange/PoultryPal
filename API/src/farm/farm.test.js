import request from "supertest";
import app from "../app";

describe("Farm", () => {
  test("create farm", async () => {
    const newFarm = {
      name: "Sunny Farms",
      location: "California",
      uid: "12345",
    };

    const response = await request(app)
      .post("/api/v1/farm")
      .send(newFarm)
      .set("Accept", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newFarm.name);
    expect(response.body.location).toBe(newFarm.location);
    expect(response.body.uid).toBe(newFarm.uid);
  });

  test("return user farms", async () => {
    const uid = "12345";

    const response = await request(app)
      .get(`/api/v1/farm?uid=${uid}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((farm) => {
      expect(farm).toHaveProperty("id");
      expect(farm).toHaveProperty("name");
      expect(farm).toHaveProperty("location");
      expect(farm.uid).toBe(uid);
    });
  });
});
