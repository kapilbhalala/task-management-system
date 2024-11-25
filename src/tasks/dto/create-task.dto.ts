import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Complete Project Documentation',
    type: String,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/, {
    message:
      'Title can only contain alphanumeric characters, spaces, and basic punctuation',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    required: false,
    example: 'Write detailed documentation for the new features',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The due date of the task (ISO 8601 format)',
    required: false,
    example: '2024-03-25T10:30:00Z',
  })
  @IsISO8601(
    { strict: true, strictSeparator: true },
    { message: 'Due date must be a valid ISO 8601 timestamp' },
  )
  @IsOptional()
  due_date?: string;

  @ApiProperty({
    description: 'Task priority (1-10)',
    minimum: 1,
    maximum: 10,
    example: 5,
    type: Number,
  })
  @IsNumber({}, { message: 'Priority must be a number' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(10, { message: 'Priority cannot be greater than 10' })
  @Type(() => Number)
  priority: number;
}

export class TaskPriorityItem {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty({ message: 'Task ID is required' })
  id: string;

  @ApiProperty({
    description: 'Task priority (1-10)',
    minimum: 1,
    maximum: 10,
    example: 5,
    type: Number,
  })
  @IsNumber({}, { message: 'Priority must be a number' })
  @IsInt({ message: 'Priority must be an integer' })
  @Min(1, { message: 'Priority must be at least 1' })
  @Max(10, { message: 'Priority cannot be greater than 10' })
  priority: number;
}

export class ReorderTasksDto {
  @ApiProperty({
    type: [TaskPriorityItem],
    description: 'Array of task IDs with their new priorities',
  })
  @ApiProperty({
    type: [TaskPriorityItem],
    description: 'Array of task IDs with their new priorities',
  })
  @ValidateNested({ each: true })
  @Type(() => TaskPriorityItem)
  @ArrayMinSize(1, { message: 'At least one task is required' })
  @ArrayMaxSize(100, { message: 'Cannot reorder more than 100 tasks at once' })
  tasks: TaskPriorityItem[];
}
