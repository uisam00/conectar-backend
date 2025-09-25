import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FileRepository } from './infrastructure/persistence/file.repository';

describe('FilesService', () => {
  let service: FilesService;

  const fileRepositoryMock = {
    findById: jest.fn(),
    findByIds: jest.fn(),
  } as unknown as FileRepository;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: FileRepository, useValue: fileRepositoryMock },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should proxy findById', async () => {
    (fileRepositoryMock.findById as jest.Mock).mockResolvedValue({ id: 'f' });
    const res = await service.findById('f' as any);
    expect(res).toEqual({ id: 'f' });
  });

  it('should proxy findByIds', async () => {
    (fileRepositoryMock.findByIds as jest.Mock).mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    const res = await service.findByIds(['a', 'b'] as any);
    expect(res).toEqual([{ id: 'a' }, { id: 'b' }]);
  });
});


