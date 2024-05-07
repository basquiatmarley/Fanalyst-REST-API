import {Context} from '@loopback/core';
import {AxiosInstance} from 'axios';
import {PoolingRequestsRepository, SportsGroupsRepository, SportsRepository} from '../../repositories';
class SportsService {
  private context: Context;
  private apiKey: String;
  private client: AxiosInstance;

  constructor(context: Context, client: AxiosInstance, apiKey: String) {
    this.context = context;
    this.apiKey = apiKey;
    this.client = client;
  }

  async get(): Promise<void> {
    console.log("EXECUTE GET Sports");
    const poolingRequestRepository = await this.context.get<PoolingRequestsRepository>('repositories.PoolingRequestsRepository');
    const sportsGroupsRepository = await this.context.get<SportsGroupsRepository>('repositories.SportsGroupsRepository');
    const sportsRepository = await this.context.get<SportsRepository>('repositories.SportsRepository');
    const now = new Date().toISOString();

    const url = `sports?apiKey=${this.apiKey}&all=true`;
    const poolingDataSaved = await poolingRequestRepository.create({
      urlRequest: url,
      type: "sports",
    });
    let responseMsg = "";

    try {
      const response = await this.client.get(url);

      if (response.status === 200) {
        const responseData = response.data;

        if (Array.isArray(responseData) && responseData.length > 0) {
          for (const dataSport of responseData) {
            const getSportsGroup = await sportsGroupsRepository.findOne({
              where: {title: dataSport.group.trim()},
            });

            if (!getSportsGroup) {
              await sportsGroupsRepository.create({
                title: dataSport.group.trim(),
                statusHotest: 1,
                status: 1,
                imageUrl: "",
                createdAt: now,
                updatedAt: now,
              });
            }

            const getSport = await sportsRepository.findOne({
              where: {key: dataSport.key.trim()},
            });

            if (!getSport) {
              await sportsRepository.create({
                sportsGroupId: getSportsGroup?.id,
                title: dataSport.title.trim(),
                status: dataSport.active,
                key: dataSport.key.trim(),
                imageUrl: "",
                createdAt: now,
                updatedAt: now,
              });

              responseMsg += `NEW SAVED SPORT: ${dataSport.title}**`;
            } else {
              await sportsRepository.updateById(getSport.id, {
                sportsGroupId: getSportsGroup?.id,
                title: dataSport.title.trim(),
                status: dataSport.active,
                key: dataSport.key.trim(),
                updatedAt: now,
              });

              responseMsg += `UPDATE SPORT: ${dataSport.title}**`;
            }
          }
        } else {
          responseMsg = "RESULT POOLING EMPTY**";
        }
      } else {
        responseMsg = "GET REQUEST ERROR";
      }
    } catch (e) {
      if (e.response) {
        responseMsg += `Error status: ${e}**`;
        responseMsg += `Error data: ${e.response.data.message}**`;
      } else {
        responseMsg += `${e}**`;
      }
    }

    await poolingRequestRepository.updateById(poolingDataSaved.id, {
      response: responseMsg,
    });
  }
}

export default SportsService
