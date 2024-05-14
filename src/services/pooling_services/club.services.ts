import {Context} from '@loopback/core';
import axios, {AxiosInstance} from 'axios';
import {Clubs} from '../../models';
import {
  ClubsRepository,
  PoolingRequestsRepository
} from '../../repositories';
class ClubService {
  private context: Context;
  private clientAxios: AxiosInstance;
  constructor(context: Context) {
    this.context = context;
    this.clientAxios = axios.create({
      baseURL: 'https://www.thesportsdb.com/api', // Base URL for your API
      timeout: 5000, // Set a request timeout
    });
  }

  async get(): Promise<void> {
    console.log('EXECUTE GET Clubs Information');
    const poolingRequestRepository =
      await this.context.get<PoolingRequestsRepository>(
        'repositories.PoolingRequestsRepository',
      );
    const clubsRepository = await this.context.get<ClubsRepository>(
      'repositories.ClubsRepository',
    );
    const now = new Date().toISOString();
    const clubs = await clubsRepository.find({
      limit: 20,
      where: {
        imageUrl: {eq: ''},
        statusDeleted: 0,
      }
    })

    for (const club of clubs) {
      var poolingDataSaved = await poolingRequestRepository.create({
        urlRequest: `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${club.name}`,
        type: 'events',
      });
      const responseMsg = await this.pooling(club);
      await poolingRequestRepository.updateById(poolingDataSaved.id, {
        response: responseMsg,
      });
      await clubsRepository.updateById(club.id, {statusDeleted: 1});
    }
  }

  async pooling(club: Clubs) {
    const clubName = club.name;
    const splitName = clubName.split(" ");
    var [getData, responseMsg] = await this.getDataApi(clubName, club.id, '');
    var founded = false;
    if (getData == false && splitName.length > 1) {
      for (const item of splitName) {
        if (item == "FC") {
          if (splitName.length > 2) {
            var [getDatax, msg] = await this.getDataApi(`${splitName[0]} FC`, club.id, '');
            responseMsg += msg;
            founded = getDatax;
            if (getDatax == false) {
              if (item[2] != undefined) {
                var [getDatax, msg] = await this.getDataApi(`${splitName[1]} FC`, club.id, '');
                responseMsg += msg;
                founded = getDatax;
              } else {
                break
              }
            } else {
              break;
            }
          }
        } else {
          var [getDatax, msg] = await this.getDataApi(item, club.id, '');
          responseMsg += msg;
          founded = getDatax;
          if (getDatax) {
            break;
          }
        }

      }
      if (splitName.length >= 2 && founded == false) {
        var [getDatax, msg] = await this.getDataApi(`${splitName[1]} ${splitName[0]}`, club.id, '');
        responseMsg += msg;
        founded = getDatax;
        if (getDatax == false) {
          if (splitName[2] != undefined) {
            var [getDatax, msg] = await this.getDataApi(`${splitName[1]} ${splitName[2]}`, club.id, '');
            responseMsg += msg;
            founded = getDatax;
            if (founded == false) {
              var [getDatax, msg] = await this.getDataApi(`${splitName[0]} ${splitName[2]}`, club.id, '');
              responseMsg += msg;
              founded = getDatax;
              if (founded == false) {
                var [getDatax, msg] = await this.getDataApi(`${splitName[2]} ${splitName[1]}`, club.id, '');
                responseMsg += msg;
                founded = getDatax;
              }
            }
          }

        }
      }
    }
    return responseMsg;
  }

  async getDataApi(clubName: string, clubId: number, responseMsg: string): Promise<[boolean, string]> {
    console.log(clubName);
    const clubsRepository = await this.context.get<ClubsRepository>(
      'repositories.ClubsRepository',
    );
    var clubNameUri = encodeURI(clubName);
    const url = `/v1/json/3/searchteams.php?t=${clubNameUri}`;
    var getData = true;
    responseMsg += `**TRYING TO GET CLUB NAME : ${clubName}**`;
    try {
      var response = await this.clientAxios.get(url);
      if (response.data != null) {
        if (response.data.teams != null) {
          const teams = response.data.teams[0];
          if (teams != null && teams != undefined) {
            await clubsRepository.updateById(clubId, {imageUrl: teams.strTeamBadge});
            responseMsg += `**UPDATING IMAGE : ${teams.strTeamBadge}**`;
            console.log("YEAY FOUND IT");
          } else {
            getData = false;
            responseMsg += `**UPDATING IMAGE FAILED TEAM NOT FOUND: ${clubName}**`;
          }
        } else {
          getData = false;
          responseMsg += `**RESULT POOLING EMPTY: ${clubName}**`;
        }
      } else {
        getData = false;
        responseMsg += `**RESULT POOLING EMPTY: ${clubName}**`;
      }
    } catch (e) {
      console.log(e);
      getData = false;
      responseMsg += `**FAILED UPDATE IMAGE : ${e} : ${clubName}**`;
    }
    return [getData, responseMsg];
  }
}

export default ClubService;
