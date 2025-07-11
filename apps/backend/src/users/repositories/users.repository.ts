// src/users/repositories/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/users.schema";
import { SignupDto } from "../../auth/dto/signup.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: SignupDto): Promise<User> {
    const user = new this.userModel(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }

  async updateLastLogin(id: string): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true })
      .exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true, runValidators: true })
      .select("-__v -password -refreshToken")
      .exec();
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.userModel
      .findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true, runValidators: true }
      )
      .exec();
  }
}
