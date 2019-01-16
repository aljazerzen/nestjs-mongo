import { Inject } from '@nestjs/common';
import { connect, MongoClient } from 'mongodb';
import { ClassType, Repository, RepositoryOptions } from 'mongodb-typescript';

const MONGO_TOKEN = 'MONGODB';

function getRepoToken(Type: ClassType<any>) {
  return Type.name + '_REPO';
}

export function InjectRepo(Type: ClassType<any>) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    Inject(getRepoToken(Type))(target, propertyKey, parameterIndex);
  }
}

function getDefaultCollectionName<T>(Type: ClassType<T>) {
  const singular = Type.name.toLowerCase();
  return singular + (singular.substr(-1) == 's' ? 'es' : 's');
}

export function forRepository<T>(
  Type: ClassType<T>,
  collection?: string,
  options: RepositoryOptions = { autoIndex: true },
) {
  return {
    provide: getRepoToken(Type),
    inject: [MONGO_TOKEN],
    useFactory: async (mongo: MongoClient) => {
      return new Repository<T>(
        Type,
        mongo,
        collection || getDefaultCollectionName<T>(Type),
        options,
      );
    },
  };
}

/**
 * @param url URL of the mongodb database (new url format eg. mongodb://localhost:27017/my-database)
 */
export function forRoot(url: string) {
  return {
    provide: MONGO_TOKEN,
    useFactory: () => {
      return connect(url, { useNewUrlParser: true });
    },
  };
}
