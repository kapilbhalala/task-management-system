import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, ReorderTasksDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('tasks')
@UsePipes(new ValidationPipe({ transform: true }))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: CreateTaskDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({
    name: 'priority',
    required: false,
    type: Number,
    description: 'Filter tasks by priority',
  })
  @ApiQuery({
    name: 'due_start',
    required: false,
    type: String,
    description: 'Filter tasks by due date start (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'due_end',
    required: false,
    type: String,
    description: 'Filter tasks by due date end (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks based on filters.',
    type: [CreateTaskDto],
  })
  findAll(
    @Query('priority') priority?: number,
    @Query('due_start') dueStart?: string,
    @Query('due_end') dueEnd?: string,
  ) {
    return this.tasksService.findAll({ priority, dueStart, dueEnd });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get all overdue tasks' })
  @ApiResponse({
    status: 200,
    description: 'Returns all tasks that are past their due date',
    type: [CreateTaskDto],
  })
  async getOverdueTasks() {
    return this.tasksService.getOverdueTasks();
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder tasks by updating their priorities' })
  @ApiResponse({
    status: 200,
    description: 'Tasks have been reordered successfully',
    type: [CreateTaskDto],
  })
  async reorderTasks(@Body() reorderTasksDto: ReorderTasksDto) {
    return this.tasksService.reorderTasks(reorderTasksDto.tasks);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: UpdateTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
