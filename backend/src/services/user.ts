import { Repository } from "typeorm"
import { User } from "../model/User.js"
import { AppDataSource } from "../lib/data-source.js"

export class UserService {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
  }

  public async create(
    user_id: string,
    user_name: string,
    wallet_address: string
  ) {
    const user = new User()
    user.user_id = user_id
    user.user_name = user_name
    user.wallet_address = wallet_address

    return await this.userRepository.save(user)
  }

  public async findByUserId(user_id: string) {
    return await this.userRepository.findOne({ where: { user_id } })
  }
}
