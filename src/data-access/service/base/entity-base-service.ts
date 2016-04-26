import HttpClient from '../../http/http-client';
import {QueryOption} from '../../../presentation/query-option';
import {EntityDBO} from '../../../business/entity-business';
import Util from '../../util';

export interface ISaveParams {
  httpClient: HttpClient;
  data: EntityDBO;
  expand: string;
  dataClassName: string;
}

export interface IRecomputeParams {
  httpClient: HttpClient;
  data: EntityDBO;
  dataClassName: string;
}

export interface ICallMethodParams {
  httpClient: HttpClient;
  dataClassName: string;
  methodName: string;
  parameters: any[];
  entityKey: string;
}

export interface IDeleteParams {
  httpClient: HttpClient;
  dataClassName: string;
  entityKey: string;
}

export class EntityBaseService {
  
  public static save({httpClient, data, expand, dataClassName}: ISaveParams) {
    
    var expandStr = '';
    if (expand) {
      expandStr = '&$expand=' + expand;
    }

    return httpClient.post({
      uri: '/' + dataClassName + '?$method=update' + expandStr,
      data
    }).then(res => {
      var entity = JSON.parse(res.body);
      delete entity.__entityModel;
      Util.removeRestInfoFromEntity(entity);

      return entity as EntityDBO;
    });
  }
  
  public static recompute({httpClient, dataClassName, data}: IRecomputeParams) {
    
    return httpClient.post({
      uri: '/' + dataClassName + '?$method=update&$refresh=true',
      data
    }).then(res => {
      var dbo = JSON.parse(res.body);
      delete dbo.__entityModel;
      Util.removeRestInfoFromEntity(dbo);
      
      return dbo as EntityDBO;
    });
  }
  
  public static callMethod({httpClient, dataClassName, methodName, parameters, entityKey}: ICallMethodParams) {
    
    return httpClient.post({
      uri: '/' + dataClassName + '(' + entityKey + ')/' + methodName,
      data: parameters
    }).then(res => {
      let obj = JSON.parse(res.body);
      return obj.result || obj || null;
    });
  }
  
  public static delete({httpClient, dataClassName, entityKey}: IDeleteParams): Promise<boolean> {
    
    return httpClient.get({
      uri: '/' + dataClassName + '(' + entityKey + ')?$method=delete'
    }).then(res => {
      let obj = JSON.parse(res.body);

      if (!(obj && obj.ok === true)) {
        return <any>Promise.reject(new Error());
      }
      else {
        return true;
      }
    });
  }
}