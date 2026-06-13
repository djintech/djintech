import { CommandBus, EventBus } from "@nestjs/cqrs";
import { ProviderType } from "@src/generated/prisma/enums";
import { EmailExamples } from "@src/modules/emails/email-examples";
import { UuidService } from "@libs/utils/src/uuid/uuid.service";
import { UserProvidersRepository } from "@src/modules/user-accounts/auth/infrastructure/user-providers.repository";
import { UsersRepository } from "@src/modules/user-accounts/auth/infrastructure/users.repository";
import { LoginUserByProviderUseCase } from "@src/modules/user-accounts/auth/application/usecases/users/login-user-by-provider.usecase";
import { UsersFactory } from "@src/modules/user-accounts/auth/application/factories/users.factory";

describe('LoginUserByProviderUseCase', () => {
  let useCase: LoginUserByProviderUseCase;
  let userProvidersRepo: Partial<UserProvidersRepository>;
  let usersRepo: Partial<UsersRepository>;
  let usersFactory: Partial<UsersFactory>;
  let uuidService: Partial<UuidService>;
  let commandBus: Partial<CommandBus>;
  let eventBus: Partial<EventBus>;
  let emailExamples: Partial<EmailExamples>;

  beforeEach(() => {
    userProvidersRepo = { findByProviderId: jest.fn(), create: jest.fn(), update: jest.fn() };
    usersRepo = { findById: jest.fn(), findByEmail: jest.fn(), create: jest.fn() };
    usersFactory = { create: jest.fn() };
    uuidService = { generate: jest.fn().mockReturnValue('UUID123') };
    commandBus = { execute: jest.fn().mockResolvedValue({ accessToken: 'AT', refreshToken: 'RT' }) };
    eventBus = { publish: jest.fn() };
    emailExamples = { registrationEmailByProvider: (providerType: string) => `fake template for ${providerType}`};

    useCase = new LoginUserByProviderUseCase(
      commandBus as any,
      userProvidersRepo as any,
      usersRepo as any,
      usersFactory as any,
      uuidService as any,
      eventBus as any,
      emailExamples as any
    );
  });

  it('should create new user and publish event', async () => {
    (userProvidersRepo.findByProviderId as jest.Mock).mockResolvedValue(null);
    (usersRepo.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersFactory.create as jest.Mock).mockResolvedValue({ email: 'test@test.com', username: 'clientUUID123' });
    (usersRepo.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });

    const result = await useCase.execute({
      userProvider: { providerId: '123', providerEmail: 'test@test.com', providerName: 'Test' },
      providerType: ProviderType.google,
      metadata: { ip: '1.1.1.1', deviceName: 'Chrome' },
    });

    expect(usersFactory.create).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'AT', refreshToken: 'RT' });
  });

  it('should find existing provider and update email if changed', async () => {
    const existingProvider = { id: 10, userId: 5, providerEmail: 'old@test.com' };
    const existingUser = { id: 5, email: 'old@test.com' };

    (userProvidersRepo.findByProviderId as jest.Mock).mockResolvedValue(existingProvider);
    (usersRepo.findById as jest.Mock).mockResolvedValue(existingUser);

    const result = await useCase.execute({
      userProvider: { providerId: '123', providerEmail: 'new@test.com', providerName: 'Test' },
      providerType: ProviderType.google,
      metadata: { ip: '1.1.1.1', deviceName: 'Chrome' },
    });

    expect(userProvidersRepo.update).toHaveBeenCalledWith(existingProvider.id, { providerEmail: 'new@test.com' });
    expect(commandBus.execute).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'AT', refreshToken: 'RT' });
  });

  it('should link provider to existing user without publishing event', async () => {
    const existingUser = { id: 5, email: 'test@test.com' };

    (userProvidersRepo.findByProviderId as jest.Mock).mockResolvedValue(null);
    (usersRepo.findByEmail as jest.Mock).mockResolvedValue(existingUser);
    (userProvidersRepo.create as jest.Mock).mockResolvedValue({});

    const result = await useCase.execute({
      userProvider: { providerId: '123', providerEmail: 'test@test.com', providerName: 'Test' },
      providerType: ProviderType.google,
      metadata: { ip: '1.1.1.1', deviceName: 'Chrome' },
    });

    expect(usersFactory.create).not.toHaveBeenCalled();
    expect(userProvidersRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      user: { connect: { id: existingUser.id } },
      provider: ProviderType.google,
      providerId: '123',
      providerEmail: 'test@test.com',
    }));
    expect(eventBus.publish).not.toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'AT', refreshToken: 'RT' });
  });

  it('should generate username if providerName is missing', async () => {
    (userProvidersRepo.findByProviderId as jest.Mock).mockResolvedValue(null);
    (usersRepo.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersFactory.create as jest.Mock).mockResolvedValue({ email: 'test@test.com', username: 'clientUUID123' });
    (usersRepo.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });

    await useCase.execute({
      userProvider: { providerId: '123', providerEmail: 'test@test.com', providerName: '' },
      providerType: ProviderType.google,
      metadata: { ip: '1.1.1.1', deviceName: 'Chrome' },
    });

    expect(uuidService.generate).toHaveBeenCalled();
  });

});
