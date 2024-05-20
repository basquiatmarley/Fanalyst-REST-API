import {Context} from '@loopback/core';
import {
  UsersFcmTokensRepository
} from '../../repositories';
class FcmUpdateService {
  private context: Context;
  constructor(context: Context) {
    this.context = context;
  }

  async get(): Promise<void> {
    console.log('EXECUTE UNUSED FCM');
    const userFcmRepo = await this.context.get<UsersFcmTokensRepository>(
      'repositories.UsersFcmTokensRepository',
    );

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    await userFcmRepo.updateAll(
      {status: 2},
      {updatedAt: {lt: fourDaysAgo}, status: 1},
    );
  }


}

export default FcmUpdateService;
