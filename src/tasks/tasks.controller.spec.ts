import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, ReorderTasksDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
describe('TasksController', () => {
  let controller: TasksController;
  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getOverdueTasks: jest.fn(),
    reorderTasks: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTaskService,
        },
      ],
    }).compile();
    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        priority: 1,
        due_date: '2024-12-31',
      };
      mockTaskService.create.mockResolvedValue(createTaskDto);
      expect(await controller.create(createTaskDto)).toEqual(createTaskDto);
    });
    it('should throw BadRequestException if validation fails', async () => {
      const createTaskDto: CreateTaskDto = {
        title: '',
        priority: 1,
        due_date: '2024-12-31',
      };
      await expect(controller.create(createTaskDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('findAll', () => {
    it('should return all tasks with filters', async () => {
      const tasks = [
        {
          title: 'Task 1',
          priority: 1,
          due_date: '2024-12-01',
        },
        {
          title: 'Task 2',
          priority: 2,
          due_date: '2024-12-05',
        },
      ];
      mockTaskService.findAll.mockResolvedValue(tasks);
      // Pass query parameters correctly
      expect(await controller.findAll(1, '2024-12-01', '2024-12-05')).toEqual(
        tasks,
      );
    });
    it('should return empty array if no tasks match filters', async () => {
      mockTaskService.findAll.mockResolvedValue([]);
      // Pass query parameters correctly
      expect(await controller.findAll(3, '2024-12-01', '2024-12-05')).toEqual(
        [],
      );
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks', async () => {
      const overdueTasks = [
        { title: 'Overdue Task', priority: 1, dueDate: '2024-11-01' },
      ];
      mockTaskService.getOverdueTasks.mockResolvedValue(overdueTasks);
      expect(await controller.getOverdueTasks()).toEqual(overdueTasks);
    });
  });
  describe('reorderTasks', () => {
    it('should reorder tasks', async () => {
      const reorderTasksDto: ReorderTasksDto = {
        tasks: [
          { id: '1', priority: 2 },
          { id: '2', priority: 1 },
        ],
      };
      mockTaskService.reorderTasks.mockResolvedValue(reorderTasksDto.tasks);
      expect(await controller.reorderTasks(reorderTasksDto)).toEqual(
        reorderTasksDto.tasks,
      );
    });
  });
  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const taskId = '1';
      mockTaskService.update.mockResolvedValue(updateTaskDto);
      expect(await controller.update(taskId, updateTaskDto)).toEqual(
        updateTaskDto,
      );
    });
    it('should throw NotFoundException if task is not found', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const taskId = 'nonexistent-id';
      mockTaskService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(taskId, updateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = '1';
      mockTaskService.remove.mockResolvedValue(undefined);
      expect(await controller.remove(taskId)).toBeUndefined();
    });
    it('should throw NotFoundException if task is not found', async () => {
      const taskId = 'nonexistent-id';
      mockTaskService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
