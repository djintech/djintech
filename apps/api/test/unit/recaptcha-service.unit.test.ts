import { DomainException } from "@libs/core/exceptions/domain-exceptions";
import { GoogleRecaptchaService } from "@src/modules/user-accounts/application/services/recaptcha.service";

describe('GoogleRecaptchaService unit test', () => {
  let service: GoogleRecaptchaService;
  let http: any;
  let config: any;

  beforeEach(() => {
    http = {
      axiosRef: {
        post: jest.fn(),
      },
    };

    config = {
      recaptchaSecret: 'secret',
    };

    service = new GoogleRecaptchaService(http, config);
  });

  it('should throw if google response invalid', async () => {
    http.axiosRef.post.mockResolvedValue({
      data: { success: false, score: 0.1 },
    });

    await expect(
      service.verify('token'),
    ).rejects.toThrow(DomainException);
  });

  it('should pass if valid', async () => {
    http.axiosRef.post.mockResolvedValue({
      data: { success: true, score: 0.9 },
    });

    await expect(
      service.verify('token'),
    ).resolves.toBeUndefined();
  });
});
