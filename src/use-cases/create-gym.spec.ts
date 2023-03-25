import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { expect, describe, it, beforeEach } from "vitest";
import { CreateGymUseCase } from "./create-gym";

let gymsRepository: InMemoryGymsRepository;
let sut: CreateGymUseCase;

describe("Create Gym Use Case", () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new CreateGymUseCase(gymsRepository);
  });

  it("should be able to create Gym", async () => {
    const { gym } = await sut.execute({
      title: "Javascript Gym",
      description: "The best Gym of the city",
      phone: "999887766",
      latitude: -4.9676288,
      longitude: -39.0070272,
    });

    expect(gym.id).toEqual(expect.any(String));
  });
});
