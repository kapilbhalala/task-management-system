import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto, TaskPriorityItem } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const task = new this.taskModel(createTaskDto);
      return await task.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(errors);
      }
      throw error;
    }
  }

  async findAll(filters: {
    priority?: number;
    dueStart?: string;
    dueEnd?: string;
  }) {
    const query: any = {};

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.dueStart || filters.dueEnd) {
      query.due_date = {};
      if (filters.dueStart) {
        query.due_date.$gte = new Date(filters.dueStart);
      }
      if (filters.dueEnd) {
        query.due_date.$lte = new Date(filters.dueEnd);
      }
    }

    return this.taskModel
      .find(query)
      .sort({ due_date: 1, priority: -1 })
      .exec();
  }

  findOne(id: string) {
    return `This action returns a #${id} task`;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  async getOverdueTasks(): Promise<Task[]> {
    const currentDate = new Date();
    return this.taskModel
      .find({
        due_date: { $lt: currentDate },
      })
      .sort({ due_date: 1 })
      .exec();
  }

  async reorderTasks(tasks: TaskPriorityItem[]): Promise<Task[]> {
    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task.id },
        update: { $set: { priority: task.priority } },
      },
    }));

    try {
      await this.taskModel.bulkWrite(bulkOps);

      // Updated tasks ને priority order માં return કરો
      const updatedTaskIds = tasks.map((task) => task.id);
      return this.taskModel
        .find({ _id: { $in: updatedTaskIds } })
        .sort({ priority: 1 })
        .exec();
    } catch (error) {
      if (error.name === 'MongoError') {
        throw new NotFoundException('Some tasks were not found');
      }
      throw error;
    }
  }
}
