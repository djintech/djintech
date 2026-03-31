import { DeleteFilesCommand, DeleteFilesCommandHandler } from "@files/modules/files/application/usecases/delete-files.use-case";

describe('DeleteFilesCommandHandler', () => {
  it('should call s3 delete', async () => {
    const s3 = { delete: jest.fn() } as any;

    const handler = new DeleteFilesCommandHandler(s3);

    await handler.execute(new DeleteFilesCommand(['key1']));

    expect(s3.delete).toHaveBeenCalledWith(['key1']);
  });
});
