import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: any;

  beforeEach(async () => {
    const mockTaskModel = {
      save: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      bulkWrite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken('Task'),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskModel = module.get(getModelToken('Task'));
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        priority: 1,
        due_date: new Date(),
      };
      const savedTask = { ...createTaskDto, _id: 'mockId' };

      taskModel.save.mockResolvedValue(savedTask);
      taskModel.save.mockImplementation(function () {
        return this;
      });

      const result = await service.create(createTaskDto as any);
      expect(result).toEqual(savedTask);
    });

    it('should throw BadRequestException on validation error', async () => {
      const createTaskDto = { title: '', priority: 1 }; // Invalid due to missing required fields
      const validationError = {
        name: 'ValidationError',
        errors: {
          title: { message: 'Title is required' },
        },
      };

      taskModel.save.mockImplementation(() => {
        throw validationError;
      });

      await expect(service.create(createTaskDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return tasks based on filters', async () => {
      const filters = {
        priority: 1,
        dueStart: '2024-01-01',
        dueEnd: '2024-12-31',
      };
      const tasks = [
        {
          _id: '1',
          title: 'Task 1',
          priority: 1,
          due_date: new Date('2024-06-01'),
        },
        {
          _id: '2',
          title: 'Task 2',
          priority: 1,
          due_date: new Date('2024-07-01'),
        },
      ];

      taskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(tasks),
        }),
      });

      const result = await service.findAll(filters);
      expect(result).toEqual(tasks);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const id = 'mockId';
      const updateTaskDto = { title: 'Updated Task' };
      const updatedTask = { _id: id, ...updateTaskDto };

      taskModel.findByIdAndUpdate.mockResolvedValue(updatedTask);

      const result = await service.update(id, updateTaskDto as any);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const id = 'mockId';
      const deletedTask = { _id: id, title: 'Task to Delete' };

      taskModel.findByIdAndDelete.mockResolvedValue(deletedTask);

      const result = await service.remove(id);
      expect(result).toEqual(deletedTask);
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks', async () => {
      const overdueTasks = [
        { _id: '1', title: 'Overdue Task 1', due_date: new Date('2024-06-01') },
      ];

      taskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(overdueTasks),
        }),
      });

      const result = await service.getOverdueTasks();
      expect(result).toEqual(overdueTasks);
    });
  });

  describe('reorderTasks', () => {
    it('should reorder tasks based on priorities', async () => {
      const tasks = [
        { id: '1', priority: 2 },
        { id: '2', priority: 1 },
      ];

      taskModel.bulkWrite.mockResolvedValue({ modifiedCount: 2 });
      taskModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(tasks),
        }),
      });

      const result = await service.reorderTasks(tasks);
      expect(result).toEqual(tasks);
      expect(taskModel.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: '1' },
            update: { $set: { priority: 2 } },
          },
        },
        {
          updateOne: {
            filter: { _id: '2' },
            update: { $set: { priority: 1 } },
          },
        },
      ]);
    });

    it('should throw NotFoundException if any task is not found', async () => {
      taskModel.bulkWrite.mockImplementation(() => {
        throw { name: 'MongoError' };
      });

      const tasks = [
        { id: '1', priority: 2 },
        { id: '2', priority: 1 },
      ];

      await expect(service.reorderTasks(tasks)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
