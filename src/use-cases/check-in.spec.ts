import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";
import { Decimal } from "@prisma/client/runtime/library";
import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { CheckInUseCase } from "./check-in";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check-in Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    gymsRepository.items.push({
      id: "gym-id",
      title: "Javascript Gym",
      description: "Academia do Javascript, a melhor da cidade!",
      phone: "999887766",
      latitude: new Decimal(-4.9676288),
      longitude: new Decimal(-39.0070272),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-id",
      userId: "user-id",
      userLatitude: -4.9676288,
      userLongitude: -39.0070272,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-id",
      userId: "user-id",
      userLatitude: -4.9676288,
      userLongitude: -39.0070272,
    });

    expect(() =>
      sut.execute({
        gymId: "gym-id",
        userId: "user-id",
        userLatitude: -4.9676288,
        userLongitude: -39.0070272,
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it("should be able to check in twice, but in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    await sut.execute({
      gymId: "gym-id",
      userId: "user-id",
      userLatitude: -4.9676288,
      userLongitude: -39.0070272,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: "gym-id",
      userId: "user-id",
      userLatitude: -4.9676288,
      userLongitude: -39.0070272,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in on distant gym", async () => {
    gymsRepository.items.push({
      id: "gym-id-2",
      title: "Javascript Gym",
      description: "Academia do Javascript, a melhor da cidade!",
      phone: "999887766",
      latitude: new Decimal(-4.9754501),
      longitude: new Decimal(-39.0109372),
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-id-2",
        userId: "user-id",
        userLatitude: -4.9676288,
        userLongitude: -39.0070272,
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
