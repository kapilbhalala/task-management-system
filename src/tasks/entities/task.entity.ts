import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  collection: 'tasks',
  timestamps: true,
  versionKey: false,
})
export class Task {
  @Prop({ type: String, nullable: false })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: Number,
    required: [true, 'Priority is required'],
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot be greater than 10'],
    validate: {
      validator: function (v: number) {
        return Number.isInteger(v);
      },
      message: 'Priority must be an integer',
    },
  })
  priority: number;

  @Prop({ type: Date })
  due_date: Date;
}
export const taskSchema = SchemaFactory.createForClass(Task);
