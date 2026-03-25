import { StatusCodes } from "http-status-codes";
import { Task } from "./taskModel";
import { ServiceResponse } from "../../common/models/serviceResponse";

export const taskService = {
  async getAll(userId: string) {
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    return ServiceResponse.success("Tasks retrieved successfully", tasks);
  },

  async getById(taskId: string, userId: string) {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success("Task retrieved successfully", task);
  },

  async create(data: { title: string; description: string; priority: string; status?: string }, userId: string) {
    const task = await Task.create({ ...data, user: userId });
    return ServiceResponse.success("Task created successfully", task, StatusCodes.CREATED);
  },

  async update(taskId: string, data: Record<string, unknown>, userId: string) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    );
    if (!task) {
      return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success("Task updated successfully", task);
  },

  async delete(taskId: string, userId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!task) {
      return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success("Task deleted successfully", null);
  },
};
